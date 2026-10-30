const fs = require('fs');
const path = require('path');

// 1. Patch MultiTaskingAdmin/src/app/api/leads/route.js
const leadsRoutePath = path.resolve('src/app/api/leads/route.js');
let leadsRouteContent = fs.readFileSync(leadsRoutePath, 'utf8');

const oldPostMemCheck = `    // 1. Always update local JSON file & memory
    const currentList = readLocalLeads();
    const existingIdx = currentList.findIndex(l => l.id === leadId);
    let updatedList;
    if (existingIdx >= 0) {
      updatedList = [...currentList];
      updatedList[existingIdx] = { ...updatedList[existingIdx], ...newLead };
    } else {
      updatedList = [newLead, ...currentList];
    }
    writeLocalLeads(updatedList);`;

const newPostMemCheck = `    // 1. Always update local JSON file & memory with phone+equipment deduplication
    const currentList = readLocalLeads();
    const cleanPhone = (newLead.phone || newLead.customerPhone || newLead.rawLeadData?.customerPhone || '').replace(/\\D/g, '').slice(-10);
    const cleanEquip = (newLead.equipment || newLead.productName || newLead.rawLeadData?.productName || '').trim().toLowerCase();

    const existingIdx = currentList.findIndex(l => {
      if (l.id && l.id === leadId) return true;
      const lPhone = (l.phone || l.customerPhone || l.rawLeadData?.customerPhone || '').replace(/\\D/g, '').slice(-10);
      const lEquip = (l.equipment || l.productName || l.rawLeadData?.productName || '').trim().toLowerCase();
      return cleanPhone && cleanEquip && lPhone === cleanPhone && lEquip === cleanEquip;
    });

    let updatedList;
    if (existingIdx >= 0) {
      const existing = currentList[existingIdx];
      newLead.id = existing.id || leadId; // Preserve original id so client & server remain in sync
      updatedList = [...currentList];
      updatedList[existingIdx] = { ...existing, ...newLead, updatedAt: nowIso };
    } else {
      updatedList = [newLead, ...currentList];
    }
    writeLocalLeads(updatedList);`;

if (leadsRouteContent.includes(oldPostMemCheck)) {
  leadsRouteContent = leadsRouteContent.replace(oldPostMemCheck, newPostMemCheck);
  fs.writeFileSync(leadsRoutePath, leadsRouteContent, 'utf8');
  console.log('1. Updated leads/route.js deduplication');
} else {
  const normC = leadsRouteContent.replace(/\r\n/g, '\n');
  const normOld = oldPostMemCheck.replace(/\r\n/g, '\n');
  if (normC.includes(normOld)) {
    leadsRouteContent = normC.replace(normOld, newPostMemCheck.replace(/\r\n/g, '\n'));
    fs.writeFileSync(leadsRoutePath, leadsRouteContent, 'utf8');
    console.log('1. Updated leads/route.js deduplication (normalized)');
  } else {
    console.warn('Could not match oldPostMemCheck in leads/route.js');
  }
}

// 2. Patch MultiTaskingAdmin/src/app/components/WebQuotationManager.jsx
const wqmPath = path.resolve('src/app/components/WebQuotationManager.jsx');
let wqmContent = fs.readFileSync(wqmPath, 'utf8');

// A. Update pendingWebLeads
const oldPendingPattern = /const pendingWebLeads = useMemo\(\(\) => \{\s*return webLeads\.filter\(lead => \{\s*const id = lead\.id \|\| lead\._id;\s*if \(processedLeadIds\.includes\(id\)\) return false;\s*const st = \(lead\.status \|\| ''\)\.toLowerCase\(\);\s*return st\.includes\('pending'\) \|\| st\.includes\('new'\) \|\| st\.includes\('rfq'\);\s*\}\);\s*\}, \[webLeads, processedLeadIds\]\);/;

const newPendingCode = `const pendingWebLeads = useMemo(() => {
    const seenCustEquip = new Set();
    const seenIds = new Set();
    const result = [];

    // Sort so profile-complete or newer leads are preferred
    const sortedLeads = [...webLeads].sort((a, b) => {
      if (a.isProfileComplete && !b.isProfileComplete) return -1;
      if (!a.isProfileComplete && b.isProfileComplete) return 1;
      return new Date(b.createdAt || b.dateTime || 0) - new Date(a.createdAt || a.dateTime || 0);
    });

    for (const lead of sortedLeads) {
      const id = lead.id || lead._id;
      if (!id || seenIds.has(id) || processedLeadIds.includes(id)) continue;

      const st = (lead.status || '').toLowerCase();
      if (!st.includes('pending') && !st.includes('new') && !st.includes('rfq')) continue;

      const phoneClean = (lead.phone || lead.customerPhone || lead.rawLeadData?.customerPhone || '').replace(/\\D/g, '').slice(-10);
      const equipClean = (lead.equipment || lead.productName || lead.rawLeadData?.productName || '').trim().toLowerCase();
      const dedupKey = phoneClean && equipClean ? \`\${phoneClean}::\${equipClean}\` : id;

      if (seenCustEquip.has(dedupKey)) {
        continue; // Skip duplicate inquiry for same hospital customer and same equipment!
      }

      seenIds.add(id);
      seenCustEquip.add(dedupKey);
      result.push(lead);
    }
    return result;
  }, [webLeads, processedLeadIds]);`;

if (oldPendingPattern.test(wqmContent)) {
  wqmContent = wqmContent.replace(oldPendingPattern, newPendingCode);
  console.log('2A. Updated pendingWebLeads with strict deduplication');
}

// B. Update handleReceiveWebLead
const oldReceivePattern = /const handleReceiveWebLead = \(freshLead\) => \{\s*if \(!freshLead\) return;\s*const freshId = freshLead\.id \|\| freshLead\._id;\s*setWebLeads\(prev => \{\s*const exists = prev\.some\(l => \(l\.id \|\| l\._id\) === freshId\);[\s\S]*?return \[freshLead, \.\.\.prev\];\s*\}\);/;

const newReceiveCode = `const handleReceiveWebLead = (freshLead) => {
    if (!freshLead) return;
    const freshId = freshLead.id || freshLead._id;
    const cleanPhone = (freshLead.phone || freshLead.customerPhone || freshLead.rawLeadData?.customerPhone || '').replace(/\\D/g, '').slice(-10);
    const cleanEquip = (freshLead.equipment || freshLead.productName || freshLead.rawLeadData?.productName || '').trim().toLowerCase();

    setWebLeads(prev => {
      const existsIdx = prev.findIndex(l => {
        if ((l.id || l._id) === freshId) return true;
        const lPhone = (l.phone || l.customerPhone || l.rawLeadData?.customerPhone || '').replace(/\\D/g, '').slice(-10);
        const lEquip = (l.equipment || l.productName || l.rawLeadData?.productName || '').trim().toLowerCase();
        return cleanPhone && cleanEquip && lPhone === cleanPhone && lEquip === cleanEquip;
      });

      if (existsIdx >= 0) {
        const copy = [...prev];
        copy[existsIdx] = { ...copy[existsIdx], ...freshLead };
        return copy;
      }
      return [freshLead, ...prev];
    });`;

if (oldReceivePattern.test(wqmContent)) {
  wqmContent = wqmContent.replace(oldReceivePattern, newReceiveCode);
  console.log('2B. Updated handleReceiveWebLead with deduplication');
}

// C. Update fetchWebLeads merging
const oldFetchMergePattern = /\/\/ Merge preserving any fresh leads currently in memory\s*const serverIds = new Set\(data\.leads\.map\(l => l\.id \|\| l\._id\)\);\s*const uncommitted = prev\.filter\(l => !serverIds\.has\(l\.id \|\| l\._id\)\);\s*return \[\.\.\.uncommitted, \.\.\.data\.leads\];/;

const newFetchMergeCode = `// Merge with strict server authority and deduplication by customer+equipment
          const serverIds = new Set(data.leads.map(l => l.id || l._id));
          const serverCustEquip = new Set();
          data.leads.forEach(l => {
            const p = (l.phone || l.customerPhone || l.rawLeadData?.customerPhone || '').replace(/\\D/g, '').slice(-10);
            const eq = (l.equipment || l.productName || l.rawLeadData?.productName || '').trim().toLowerCase();
            if (p && eq) serverCustEquip.add(\`\${p}::\${eq}\`);
          });

          const uncommitted = prev.filter(l => {
            if (serverIds.has(l.id || l._id)) return false;
            const p = (l.phone || l.customerPhone || l.rawLeadData?.customerPhone || '').replace(/\\D/g, '').slice(-10);
            const eq = (l.equipment || l.productName || l.rawLeadData?.productName || '').trim().toLowerCase();
            if (p && eq && serverCustEquip.has(\`\${p}::\${eq}\`)) return false;
            return true;
          });

          return [...uncommitted, ...data.leads];`;

if (oldFetchMergePattern.test(wqmContent)) {
  wqmContent = wqmContent.replace(oldFetchMergePattern, newFetchMergeCode);
  console.log('2C. Updated fetchWebLeads merge deduplication');
}

fs.writeFileSync(wqmPath, wqmContent, 'utf8');
console.log('Successfully updated WebQuotationManager.jsx');

// 3. Patch MultiTaskingAdmin/src/app/page.jsx
const pagePath = path.resolve('src/app/page.jsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

const oldFilteredLeadsBlock = `  const filteredLeads = [...leads]
    .filter(l => {
      if (leadFilterDomain !== 'all' && l.siteDomain !== leadFilterDomain) {
        return false;
      }
      if (activeDistrictFilter && activeDistrictFilter !== 'all' && activeDistrictFilter !== 'All Districts / Pan-India HQ') {
        const d = activeDistrictFilter.toLowerCase();
        const loc = \`\${l.district || ''} \${l.city || ''} \${l.hospital || ''} \${l.address || ''}\`.toLowerCase();
        if (!loc.includes(d)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Guarantee newest leads are ALWAYS on top
      const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
      const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });`;

const newFilteredLeadsBlock = `  const rawFilteredLeads = [...leads]
    .filter(l => {
      if (leadFilterDomain !== 'all' && l.siteDomain !== leadFilterDomain) {
        return false;
      }
      if (activeDistrictFilter && activeDistrictFilter !== 'all' && activeDistrictFilter !== 'All Districts / Pan-India HQ') {
        const d = activeDistrictFilter.toLowerCase();
        const loc = \`\${l.district || ''} \${l.city || ''} \${l.hospital || ''} \${l.address || ''}\`.toLowerCase();
        if (!loc.includes(d)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
      const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return String(b.id || '').localeCompare(String(a.id || ''));
    });

  // Strict Deduplication: Same customer phone + equipment only displays ONCE (latest entry)
  const seenTableCustEquip = new Set();
  const seenTableIds = new Set();
  const filteredLeads = [];
  for (const l of rawFilteredLeads) {
    const id = l.id || l._id;
    if (!id || seenTableIds.has(id)) continue;
    const p = (l.phone || l.customerPhone || l.rawLeadData?.customerPhone || '').replace(/\\D/g, '').slice(-10);
    const eq = (l.equipment || l.productName || l.rawLeadData?.productName || '').trim().toLowerCase();
    const key = p && eq ? \`\${p}::\${eq}\` : id;
    if (seenTableCustEquip.has(key)) continue;
    seenTableIds.add(id);
    seenTableCustEquip.add(key);
    filteredLeads.push(l);
  }`;

if (pageContent.includes(oldFilteredLeadsBlock)) {
  pageContent = pageContent.replace(oldFilteredLeadsBlock, newFilteredLeadsBlock);
  fs.writeFileSync(pagePath, pageContent, 'utf8');
  console.log('3. Updated filteredLeads deduplication in page.jsx');
} else {
  const normP = pageContent.replace(/\r\n/g, '\n');
  const normOldP = oldFilteredLeadsBlock.replace(/\r\n/g, '\n');
  if (normP.includes(normOldP)) {
    pageContent = normP.replace(normOldP, newFilteredLeadsBlock.replace(/\r\n/g, '\n'));
    fs.writeFileSync(pagePath, pageContent, 'utf8');
    console.log('3. Updated filteredLeads deduplication in page.jsx (normalized)');
  } else {
    console.warn('Could not match oldFilteredLeadsBlock in page.jsx');
  }
}

