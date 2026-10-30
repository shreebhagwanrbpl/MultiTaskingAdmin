const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/app/components/WebQuotationManager.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add activeNegotiationNotice state
const stateTarget = /const \[incomingQuotationAlert, setIncomingQuotationAlert\] = useState\(null\);/;
const stateAddition = `const [incomingQuotationAlert, setIncomingQuotationAlert] = useState(null);
  const [activeNegotiationNotice, setActiveNegotiationNotice] = useState(null);`;

if (stateTarget.test(content) && !content.includes('activeNegotiationNotice')) {
  content = content.replace(stateTarget, stateAddition);
  console.log('1. Added activeNegotiationNotice state');
}

// 2. Patch handleMakeQuotationFromLead
const priceMatchPattern = /if \(matched\) \{[\s\S]*?unitPrice = parseFloat\(lead\.price \|\| raw\.unitPrice\) \|\| 150000;\s*\}\s*if \(lead\.specs/s;

// Let's inspect the exact lines around 622-648 first
const oldPricingBlock = `    if (matched) {
      itemTitle = matched.name || matched.title || rawTitle;
      itemCode = matched.sku || matched.model || itemCode;
      unitPrice = parseFloat(matched.price) || 150000;

      if (matched.specs && typeof matched.specs === 'object') {
        bulletsList = Object.entries(matched.specs).slice(0, 5).map(([k, v]) => \`\${k}: \${v}\`);
      } else if (matched.features && Array.isArray(matched.features)) {
        bulletsList = matched.features.slice(0, 5);
      }
      if (bulletsList.length === 0 && matched.shortDesc) {
        bulletsList.push(matched.shortDesc);
      }
    } else {
      const parsedAmount = parseFloat((lead.quoteAmount || '').replace(/[^0-9.]/g, '')) || 0;
      if (parsedAmount > 0) {
        unitPrice = Math.round(parsedAmount / rawQty);
      } else if (lead.price || raw.unitPrice) {
        unitPrice = parseFloat(lead.price || raw.unitPrice) || 150000;
      }

      if (lead.specs && typeof lead.specs === 'object') {
        bulletsList = Object.entries(lead.specs).slice(0, 5).map(([k, v]) => \`\${k}: \${v}\`);
      } else if (lead.features && Array.isArray(lead.features)) {
        bulletsList = lead.features.slice(0, 5);
      }
    }`;

const newPricingBlock = `    if (matched) {
      itemTitle = matched.name || matched.title || rawTitle;
      itemCode = matched.sku || matched.model || itemCode;
      unitPrice = parseFloat(matched.price) || 150000;

      if (matched.specs && typeof matched.specs === 'object') {
        bulletsList = Object.entries(matched.specs).slice(0, 5).map(([k, v]) => \`\${k}: \${v}\`);
      } else if (matched.features && Array.isArray(matched.features)) {
        bulletsList = matched.features.slice(0, 5);
      }
      if (bulletsList.length === 0 && matched.shortDesc) {
        bulletsList.push(matched.shortDesc);
      }
    } else {
      const parsedAmount = parseFloat((lead.quoteAmount || '').replace(/[^0-9.]/g, '')) || 0;
      if (parsedAmount > 0) {
        unitPrice = Math.round(parsedAmount / rawQty);
      } else if (lead.price || raw.unitPrice) {
        unitPrice = parseFloat(lead.price || raw.unitPrice) || 150000;
      }

      if (lead.specs && typeof lead.specs === 'object') {
        bulletsList = Object.entries(lead.specs).slice(0, 5).map(([k, v]) => \`\${k}: \${v}\`);
      } else if (lead.features && Array.isArray(lead.features)) {
        bulletsList = lead.features.slice(0, 5);
      }
    }

    // OVERRIDE WITH ADMIN APPROVED OR COUNTER-OFFERED NEGOTIATION PRICE
    if (lead.negotiationStatus === 'approved' && lead.approvedPrice) {
      unitPrice = parseFloat(lead.approvedPrice);
      setActiveNegotiationNotice({
        type: 'approved',
        price: unitPrice,
        message: \`Admin Approved Negotiated Price Applied: ₹\${unitPrice.toLocaleString('en-IN')} (Target Price Approved by Admin)\`
      });
    } else if (lead.negotiationStatus === 'counter_offered' && lead.adminCounterPrice) {
      unitPrice = parseFloat(lead.adminCounterPrice);
      setActiveNegotiationNotice({
        type: 'counter_offered',
        price: unitPrice,
        message: \`Admin Counter-Offer Rate Applied: ₹\${unitPrice.toLocaleString('en-IN')}\${lead.adminNote ? \` — Note: "\${lead.adminNote}"\` : ''}\`
      });
    } else if (lead.expectedPrice && !lead.isPriceNegotiated) {
      unitPrice = parseFloat(lead.expectedPrice);
      setActiveNegotiationNotice(null);
    } else if (lead.approvedPrice) {
      unitPrice = parseFloat(lead.approvedPrice);
      setActiveNegotiationNotice(null);
    } else {
      setActiveNegotiationNotice(null);
    }`;

// Normalize newlines for matching
const normContent = content.replace(/\r\n/g, '\n');
const normOldBlock = oldPricingBlock.replace(/\r\n/g, '\n');

if (normContent.includes(normOldBlock)) {
  const normNewBlock = newPricingBlock.replace(/\r\n/g, '\n');
  content = normContent.replace(normOldBlock, normNewBlock);
  console.log('2. Replaced pricing block with negotiation override');
} else {
  console.warn('Could not match oldPricingBlock in WebQuotationManager.jsx');
}

// 3. Add Banner right before items list
const itemsListTarget = '{/* Items Card / Row List */}';
const bannerHtml = `{activeNegotiationNotice && (
                  <div className={\`p-3.5 mb-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold shadow-xs \${
                    activeNegotiationNotice.type === 'approved'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-indigo-50 border-indigo-300 text-indigo-900'
                  }\`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{activeNegotiationNotice.type === 'approved' ? '✅' : '🤝'}</span>
                      <span>{activeNegotiationNotice.message}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-current shrink-0">
                      Rate: ₹{activeNegotiationNotice.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {/* Items Card / Row List */}`;

if (content.includes(itemsListTarget) && !content.includes('activeNegotiationNotice && (')) {
  content = content.replace(itemsListTarget, bannerHtml);
  console.log('3. Added activeNegotiationNotice banner before items list');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Finished updating WebQuotationManager.jsx');

