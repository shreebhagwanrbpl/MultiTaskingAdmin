const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'components', 'WebQuotationManager.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix ReferenceError: hospitalName is not defined and multi-item quotation creation in handleMakeQuotationFromLead
const oldMakeQuotationSnippet = `    const finalCustomerName = (cleanHospitalName && cleanHospitalName !== 'NA') ? cleanHospitalName : (docName || 'NA');
    setCustomerName(finalCustomerName);`;

const newMakeQuotationSnippet = `    const finalCustomerName = (cleanHospitalName && cleanHospitalName !== 'NA') ? cleanHospitalName : (docName || 'NA');
    const hospitalName = finalCustomerName;
    setCustomerName(finalCustomerName);`;

if (!content.includes('const hospitalName = finalCustomerName;')) {
  content = content.replace(oldMakeQuotationSnippet, newMakeQuotationSnippet);
  console.log('Fixed hospitalName declaration in handleMakeQuotationFromLead');
} else {
  console.log('hospitalName declaration already present');
}

// 2. Enhance handleMakeQuotationFromLead to populate all cartProducts for bulk/multi-item leads
const oldItemsBlock = `    if (lead.items && Array.isArray(lead.items) && lead.items.length > 0) {
      const parsedItems = lead.items.map((it, idx) => ({
        id: \`cart-item-\${idx}-\${Date.now()}\`,
        sr: idx + 1,
        itemCode: it.sku || \`ITEM-\${idx + 1}\`,
        title: it.description || it.name,
        bullets: it.specs || 'CDSCO Medical Device Certified • Complete On-Site Commissioning',
        qty: it.quantity || 1,
        unitLabel: 'No',
        unitPrice: it.rate || it.price || 0
      }));
      setItems(parsedItems);
    } else {
      setItems([leadQuotationItem]);
    }`;

const newItemsBlock = `    const rawCartList = (
      (Array.isArray(lead.rawLeadData?.cartProducts) && lead.rawLeadData.cartProducts.length > 0) ? lead.rawLeadData.cartProducts :
      (Array.isArray(lead.cartProducts) && lead.cartProducts.length > 0) ? lead.cartProducts :
      (Array.isArray(lead.items) && lead.items.length > 0) ? lead.items :
      (Array.isArray(lead.rawLeadData?.items) && lead.rawLeadData.items.length > 0) ? lead.rawLeadData.items :
      null
    );

    let finalQuotationItems = [leadQuotationItem];

    if (rawCartList && rawCartList.length > 0) {
      finalQuotationItems = rawCartList.map((it, idx) => {
        const itTitle = it.name || it.title || it.productName || it.description || \`Equipment Item \${idx + 1}\`;
        const itSku = it.sku || it.productSku || \`MED-ITEM-\${idx + 1}\`;
        const itQty = parseInt(it.qty || it.quantity || 1, 10) || 1;
        const itPrice = parseFloat(it.price || it.rate || it.unitPrice || 0);

        const matchedCp = catalogProducts.find(cp =>
          (it.id && cp.id === it.id) ||
          (itSku && cp.sku && cp.sku.toLowerCase() === itSku.toLowerCase()) ||
          (cp.name && cp.name.toLowerCase().includes(itTitle.toLowerCase())) ||
          (itTitle && itTitle.toLowerCase().includes((cp.name || '').toLowerCase()))
        );

        let itemBullets = [];
        if (matchedCp?.specs && typeof matchedCp.specs === 'object') {
          itemBullets = Object.entries(matchedCp.specs).slice(0, 4).map(([k, v]) => \`\${k}: \${v}\`);
        } else if (matchedCp?.features && Array.isArray(matchedCp.features)) {
          itemBullets = matchedCp.features.slice(0, 4);
        }
        if (itemBullets.length === 0 && it.warranty) {
          itemBullets.push(it.warranty);
        }
        if (itemBullets.length === 0) {
          itemBullets = [
            'CDSCO Medical Device Rules 2017 & ISO 13485:2016 Certified Direct OEM Unit',
            'Complete unboxing, hospital electrical grounding & on-site clinical commissioning',
            'Includes Comprehensive OEM Warranty & 24/7 on-call engineering breakdown response'
          ];
        }

        return {
          id: \`cart-item-\${idx}-\${Date.now()}\`,
          sr: idx + 1,
          itemCode: itSku,
          title: itTitle,
          bullets: itemBullets.join('\\n'),
          qty: itQty,
          unitLabel: 'No',
          unitPrice: itPrice
        };
      });

      setItems(finalQuotationItems);
    } else {
      setItems([leadQuotationItem]);
    }`;

if (content.includes(oldItemsBlock)) {
  content = content.replace(oldItemsBlock, newItemsBlock);
  console.log('Replaced oldItemsBlock with multi-item finalQuotationItems');
}

// 3. Fix newQuotationRecord to include finalQuotationItems & totalAmount
const oldRecordBlock = `    // Save official quotation to /api/quotations
    const newQuotationRecord = {
      refNo: freshRef,
      leadId: lead.id,
      date: getTodayFormatted(),
      customerName: hospitalName,
      customerAddress1: [doctorPart, phonePart].filter(Boolean).join(', '),
      customerAddress2: [cityPart, emailPart].filter(Boolean).join(' • '),
      subjectLetter: \`Quotation purchase of \${itemTitle}\`,
      subjectQuotation: \`Purchase of \${itemTitle}\${itemCode ? \`, Model: \${itemCode}\` : ''}\`,
      items: [leadQuotationItem],
      totalAmount: unitPrice * rawQty,
      status: 'Ready',
      isManualAdminQuotation: true,
      lead
    };`;

const newRecordBlock = `    // 4b. Multi-item subjects
    const isMultiPortfolio = rawCartList && rawCartList.length > 1;
    const computedSubjectLetter = isMultiPortfolio
      ? \`Quotation for Portfolio of \${rawCartList.length} Medical Equipment Systems\`
      : \`Quotation purchase of \${itemTitle}\`;
    const computedSubjectQuotation = isMultiPortfolio
      ? \`Supply, Installation & Clinical Commissioning of \${rawCartList.length} Medical Diagnostic & OT Systems\`
      : \`Purchase of \${itemTitle}\${itemCode ? \`, Model: \${itemCode}\` : ''}\`;

    setSubjectLetter(computedSubjectLetter);
    setSubjectQuotation(computedSubjectQuotation);

    const totalQuotationAmount = finalQuotationItems.reduce(
      (sum, it) => sum + ((Number(it.unitPrice) || 0) * (Number(it.qty) || 1)),
      0
    );

    // Save official quotation to /api/quotations
    const newQuotationRecord = {
      refNo: freshRef,
      leadId: lead.id,
      date: getTodayFormatted(),
      customerName: finalCustomerName,
      customerAddress1: [doctorPart, phonePart].filter(Boolean).join(', '),
      customerAddress2: [cityPart, emailPart].filter(Boolean).join(' • '),
      subjectLetter: computedSubjectLetter,
      subjectQuotation: computedSubjectQuotation,
      items: finalQuotationItems,
      totalAmount: totalQuotationAmount,
      status: 'Ready',
      isManualAdminQuotation: true,
      lead
    };`;

if (content.includes(oldRecordBlock)) {
  content = content.replace(oldRecordBlock, newRecordBlock);
  console.log('Updated newQuotationRecord with multi-item data');
}

// 4. Add getLeadProducts helper if not already present
if (!content.includes('const getLeadProducts =')) {
  const targetHook = '  const currentPendingLead = pendingWebLeads[selectedLeadIdx] || pendingWebLeads[0] || null;';
  const helperCode = `  const getLeadProducts = (lead) => {
    const raw = lead?.rawLeadData || {};
    if (Array.isArray(raw.cartProducts) && raw.cartProducts.length > 0) {
      return raw.cartProducts;
    }
    if (Array.isArray(lead?.cartProducts) && lead.cartProducts.length > 0) {
      return lead.cartProducts;
    }
    if (Array.isArray(lead?.items) && lead.items.length > 0) {
      return lead.items;
    }
    if (Array.isArray(raw.items) && raw.items.length > 0) {
      return raw.items;
    }
    const singleName = lead?.productName || lead?.equipment || raw.productName || 'Medical Equipment';
    const singleSku = lead?.productSku || raw.productSku || '';
    const singlePrice = lead?.price || raw.unitPrice || (lead?.quoteAmount ? parseFloat(String(lead.quoteAmount).replace(/[^0-9.]/g, '')) : 0);
    const singleQty = lead?.quantity || raw.qty || 1;
    const singleBrand = lead?.brandName || raw.brandName || raw.brand || '';
    const singleWarranty = lead?.warranty || raw.warranty || '';
    return [{
      name: singleName,
      sku: singleSku,
      price: singlePrice,
      qty: singleQty,
      brand: singleBrand,
      warranty: singleWarranty
    }];
  };

  const currentPendingLead = pendingWebLeads[selectedLeadIdx] || pendingWebLeads[0] || null;`;

  content = content.replace(targetHook, helperCode);
  console.log('Added getLeadProducts helper');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Phase 1 changes written successfully.');

