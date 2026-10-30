const fs = require('fs');
const filePath = 'C:\\Users\\Admin\\Documents\\GitHub\\rajbiosis.com\\src\\utils\\adminSync.js';
let content = fs.readFileSync(filePath, 'utf8');

const oldPayload = `    // Payload for Leads Pipeline
    const leadPayload = {
      id: leadId,
      doctorName: lead.customerName || lead.fullName || 'Medical Client',
      hospital: lead.hospitalName || 'Healthcare Facility',
      city: lead.district || 'Jaipur',
      address: lead.address || '',
      email: lead.customerEmail || lead.email || '',
      phone: phone,
      siteDomain: SITE_DOMAIN,
      brandName: 'Raj Biosis',
      equipment: equipment || (lead.cartProducts ? \`\${lead.cartProducts.length} Equipment Package\` : 'Biomedical Equipment'),
      quoteAmount: lead.grandTotal ? \`₹\${Number(lead.grandTotal).toLocaleString('en-IN')}\` : '₹0',
      status: lead.status || 'Pending RFQ',
      isProfileComplete: isProfileComplete,
      date: lead.date && lead.date !== 'Just now' ? lead.date : syncDateStr,
      time: lead.time || syncTimeStr,
      dateTime: lead.dateTime || syncDateTimeStr,
      createdAt: lead.createdAt || syncNow.toISOString(),
      rawLeadData: lead
    };`;

const newPayload = `    // Negotiation values
    const catalogBase = Number(lead.actualPrice || lead.unitPrice || lead.price || 485000);
    const offerPrice = lead.expectedPrice ? Number(lead.expectedPrice) : null;
    const isNegotiated = Boolean(lead.isNegotiable && offerPrice && offerPrice < catalogBase);

    // Payload for Leads Pipeline
    const leadPayload = {
      id: leadId,
      doctorName: lead.customerName || lead.fullName || 'Medical Client',
      hospital: lead.hospitalName || 'Healthcare Facility',
      city: lead.district || 'Jaipur',
      address: lead.address || '',
      email: lead.customerEmail || lead.email || '',
      phone: phone,
      siteDomain: SITE_DOMAIN,
      brandName: 'Raj Biosis',
      equipment: equipment || (lead.cartProducts ? \`\${lead.cartProducts.length} Equipment Package\` : 'Biomedical Equipment'),
      price: isNegotiated ? offerPrice : catalogBase,
      actualPrice: catalogBase,
      expectedPrice: offerPrice,
      isPriceNegotiated: isNegotiated,
      isNegotiable: Boolean(lead.isNegotiable),
      negotiationStatus: isNegotiated ? 'pending_approval' : (lead.negotiationStatus || 'none'),
      approvedPrice: isNegotiated ? null : (lead.approvedPrice || catalogBase),
      adminCounterPrice: lead.adminCounterPrice || null,
      adminNote: lead.adminNote || null,
      quoteAmount: lead.grandTotal ? \`₹\${Number(lead.grandTotal).toLocaleString('en-IN')}\` : \`₹\${(isNegotiated ? offerPrice : catalogBase).toLocaleString('en-IN')}\`,
      status: isNegotiated ? 'Pending Price Approval' : (lead.status || 'Pending RFQ'),
      isProfileComplete: isProfileComplete,
      date: lead.date && lead.date !== 'Just now' ? lead.date : syncDateStr,
      time: lead.time || syncTimeStr,
      dateTime: lead.dateTime || syncDateTimeStr,
      createdAt: lead.createdAt || syncNow.toISOString(),
      rawLeadData: lead
    };`;

if (content.includes(oldPayload)) {
  content = content.replace(oldPayload, newPayload);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated leadPayload in adminSync.js');
} else {
  const normContent = content.replace(/\r\n/g, '\n');
  const normOld = oldPayload.replace(/\r\n/g, '\n');
  if (normContent.includes(normOld)) {
    content = normContent.replace(normOld, newPayload.replace(/\r\n/g, '\n'));
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated leadPayload in adminSync.js (normalized)');
  } else {
    console.warn('Could not match oldPayload in adminSync.js');
  }
}

