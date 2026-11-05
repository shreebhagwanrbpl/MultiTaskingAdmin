const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'app', 'components', 'WebQuotationManager.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Update handleSubmitOnCallBargain
const oldBargainBlock = `      setSuccessToast(\`Quotation \${onCallBargainQuote.refNo} submitted to Admin! Requested reduction: ₹\${gap.toLocaleString('en-IN')}.\`);
      setOnCallBargainQuote(null);

      // Broadcast to Admin ONLY. The sales rep does NOT receive push notification on their own screen!
      broadcastSystemNotification({
        type: 'quotation_concession_requested',
        targetRole: 'admin',
        quote: { ...onCallBargainQuote, ...updateData },
        requestedBy: user?.fullName || user?.name || 'Sales Team (shree)'
      });`;

const newBargainBlock = `      setSuccessToast(\`Quotation \${onCallBargainQuote.refNo} submitted to Admin! Requested reduction: ₹\${gap.toLocaleString('en-IN')}.\`);
      setOnCallBargainQuote(null);

      // 1. Immediately trigger Native Desktop Push Notification with Sound on click!
      triggerSystemPushNotification({
        title: '⚠️ Price Concession Approval Requested',
        body: \`Price concession requested for \${onCallBargainQuote.customerName || 'Customer'} (Ref: \${onCallBargainQuote.refNo}). Demanded: ₹\${totalDemanded.toLocaleString('en-IN')} (Gap: ₹\${gap.toLocaleString('en-IN')}). Awaiting Admin decision.\`,
        tag: \`quote-concession-\${onCallBargainQuote.refNo || quoteId}\`,
        onClick: () => {
          if (typeof window !== 'undefined') window.focus();
        }
      });

      // 2. Broadcast across all active tabs, sessions & admin desks
      broadcastSystemNotification({
        type: 'quotation_concession_requested',
        targetRole: 'admin',
        quote: { ...onCallBargainQuote, ...updateData },
        requestedBy: user?.fullName || user?.name || 'Sales Team (shree)'
      });`;

// 2. Update handleAdminApproveDirectDiscount
const oldDirectBlock = `      setSuccessToast(\`Direct price discount approved! Deal locked at ₹\${Number(approvedTotal).toLocaleString('en-IN')}.\`);
      setAdminConcessionQuote(null);

      // Broadcast concession approval to Sales team ONLY
      broadcastSystemNotification({
        type: 'quotation_concession_approved',
        targetRole: 'sales',
        quote: { ...quote, ...updateData },
        approvedBy: user?.name || user?.fullName || 'Admin'
      });`;

const newDirectBlock = `      setSuccessToast(\`Direct price discount approved! Deal locked at ₹\${Number(approvedTotal).toLocaleString('en-IN')}.\`);
      setAdminConcessionQuote(null);

      // 1. Immediately trigger Native Push Notification with Sound on click!
      triggerSystemPushNotification({
        title: '🎉 Quotation Concession Approved (Direct Discount)',
        body: \`Admin approved direct price discount for \${quote.customerName || 'Customer'} (\${quote.refNo}). Deal locked at ₹\${Number(approvedTotal).toLocaleString('en-IN')}.\`,
        tag: \`quote-approved-\${quote.refNo || quoteId}\`,
        onClick: () => {
          if (typeof window !== 'undefined') window.focus();
        }
      });

      // 2. Broadcast concession approval to Sales team
      broadcastSystemNotification({
        type: 'quotation_concession_approved',
        targetRole: 'sales',
        quote: { ...quote, ...updateData },
        approvedBy: user?.name || user?.fullName || 'Admin'
      });`;

// 3. Update handleAdminApprovePerk
const oldPerkBlock = `      setSuccessToast(\`Approved ₹\${Number(perkBudget).toLocaleString('en-IN')} complimentary perk! Machine cash floor preserved at ₹\${Number(floor).toLocaleString('en-IN')}.\`);
      setAdminConcessionQuote(null);

      // Broadcast concession approval to Sales team ONLY
      broadcastSystemNotification({
        type: 'quotation_concession_approved',
        targetRole: 'sales',
        quote: { ...quote, ...updateData },
        approvedBy: user?.name || user?.fullName || 'Admin'
      });`;

const newPerkBlock = `      setSuccessToast(\`Approved ₹\${Number(perkBudget).toLocaleString('en-IN')} complimentary perk! Machine cash floor preserved at ₹\${Number(floor).toLocaleString('en-IN')}.\`);
      setAdminConcessionQuote(null);

      // 1. Immediately trigger Native Push Notification with Sound on click!
      triggerSystemPushNotification({
        title: '🎁 Quotation Concession Approved (Complimentary Perk)',
        body: \`Admin authorized ₹\${Number(perkBudget).toLocaleString('en-IN')} complimentary perk for \${quote.customerName || 'Customer'} (\${quote.refNo}). Machine floor preserved at ₹\${Number(floor).toLocaleString('en-IN')}.\`,
        tag: \`quote-approved-\${quote.refNo || quoteId}\`,
        onClick: () => {
          if (typeof window !== 'undefined') window.focus();
        }
      });

      // 2. Broadcast concession approval to Sales team
      broadcastSystemNotification({
        type: 'quotation_concession_approved',
        targetRole: 'sales',
        quote: { ...quote, ...updateData },
        approvedBy: user?.name || user?.fullName || 'Admin'
      });`;

// 4. Update handleAdminApproveLeadFloor
const oldLeadFloorBlock = `      setSuccessToast(\`✅ Price Approved! ₹\${approvedAmount.toLocaleString('en-IN')} approved for \${lead.hospital || lead.equipment}. Sales employees can now make the quotation.\`);

      // Broadcast deal floor approval to Sales team
      broadcastSystemNotification({
        type: 'lead_deal_floor_approved',
        targetRole: 'sales',
        approvalType: 'customer_expected_price',
        approvedAmount: approvedAmount,
        lead: { ...lead, ...updateData },
        approvedBy: user?.fullName || user?.name || 'Admin'
      });
      setNegotiationModalLead(null);`;

const newLeadFloorBlock = `      setSuccessToast(\`✅ Price Approved! ₹\${approvedAmount.toLocaleString('en-IN')} approved for \${lead.hospital || lead.equipment}. Sales employees can now make the quotation.\`);

      // 1. Immediately trigger Native Push Notification with Sound on click!
      triggerSystemPushNotification({
        title: '✅ Customer Expected Price Authorized!',
        body: \`Admin approved ₹\${approvedAmount.toLocaleString('en-IN')} for \${lead.hospital || lead.equipment}. Ready to create quotation!\`,
        tag: \`lead-approved-\${lead.id || lead._id}\`,
        onClick: () => {
          if (typeof window !== 'undefined') window.focus();
        }
      });

      // 2. Broadcast deal floor approval to Sales team
      broadcastSystemNotification({
        type: 'lead_deal_floor_approved',
        targetRole: 'sales',
        approvalType: 'customer_expected_price',
        approvedAmount: approvedAmount,
        lead: { ...lead, ...updateData },
        approvedBy: user?.fullName || user?.name || 'Admin'
      });
      setNegotiationModalLead(null);`;

// 5. Update handleAdminCounterLead
const oldLeadCounterBlock = `      setSuccessToast(\`🤝 Counter Offer Set! In-between rate ₹\${numPrice.toLocaleString('en-IN')} set for \${lead.hospital || lead.equipment}. Sales employees can now proceed with quotation.\`);
      broadcastSystemNotification({
        type: 'lead_deal_floor_approved',
        targetRole: 'sales',
        approvalType: 'in_between_rate',
        approvedAmount: numPrice,
        lead: { ...lead, ...updateData },
        approvedBy: user?.fullName || user?.name || 'Admin'
      });
      setNegotiationModalLead(null);`;

const newLeadCounterBlock = `      setSuccessToast(\`🤝 Counter Offer Set! In-between rate ₹\${numPrice.toLocaleString('en-IN')} set for \${lead.hospital || lead.equipment}. Sales employees can now proceed with quotation.\`);

      // 1. Immediately trigger Native Push Notification with Sound on click!
      triggerSystemPushNotification({
        title: '🤝 In-Between Counter Rate Authorized!',
        body: \`Admin set counter offer ₹\${numPrice.toLocaleString('en-IN')} for \${lead.hospital || lead.equipment}. Ready to create quotation!\`,
        tag: \`lead-counter-\${lead.id || lead._id}\`,
        onClick: () => {
          if (typeof window !== 'undefined') window.focus();
        }
      });

      // 2. Broadcast deal floor approval to Sales team
      broadcastSystemNotification({
        type: 'lead_deal_floor_approved',
        targetRole: 'sales',
        approvalType: 'in_between_rate',
        approvedAmount: numPrice,
        lead: { ...lead, ...updateData },
        approvedBy: user?.fullName || user?.name || 'Admin'
      });
      setNegotiationModalLead(null);`;

function replaceBlock(source, oldBlock, newBlock) {
  const isCRLF = source.includes('\r\n');
  const targetOld = isCRLF ? oldBlock.replace(/\n/g, '\r\n') : oldBlock.replace(/\r\n/g, '\n');
  const targetNew = isCRLF ? newBlock.replace(/\n/g, '\r\n') : newBlock.replace(/\r\n/g, '\n');
  if (source.includes(targetOld)) {
    return source.replace(targetOld, targetNew);
  } else {
    console.warn('Could not find block:', targetOld.slice(0, 50));
    return source;
  }
}

code = replaceBlock(code, oldBargainBlock, newBargainBlock);
code = replaceBlock(code, oldDirectBlock, newDirectBlock);
code = replaceBlock(code, oldPerkBlock, newPerkBlock);
code = replaceBlock(code, oldLeadFloorBlock, newLeadFloorBlock);
code = replaceBlock(code, oldLeadCounterBlock, newLeadCounterBlock);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully applied quotation push notification updates!');

