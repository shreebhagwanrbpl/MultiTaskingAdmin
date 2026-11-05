const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'app', 'components', 'WebQuotationManager.jsx');
let code = fs.readFileSync(filePath, 'utf8');

const oldCardBlock = `                  const rawHosp = (matchedCustomer?.hospitalName || lead.hospital || lead.hospitalName || lead.rawLeadData?.hospitalName || '').trim();
                  const cleanHospital = cleanLeadHospital(rawHosp);
                  const displayHospital = cleanHospital || matchedCustomer?.fullName || lead.doctorName || lead.customerName || 'Registered Customer';
                  const displayContact = matchedCustomer?.fullName || lead.doctorName || 'Procurement Officer';
                  const displayPhone = matchedCustomer?.phone || lead.phone;
                  const displayEmail = matchedCustomer?.email || lead.email;
                  const displayLocation = matchedCustomer?.district || matchedCustomer?.address || lead.city || 'India';`;

const newCardBlock = `                  const rawHosp = (matchedCustomer?.hospitalName || lead.hospital || lead.hospitalName || lead.rawLeadData?.hospitalName || '').trim();
                  const displayHospital = cleanLeadHospital(rawHosp);
                  const displayContact = matchedCustomer?.fullName || lead.doctorName || lead.customerName || 'NA';
                  const displayPhone = matchedCustomer?.phone || lead.phone || 'NA';
                  const displayEmail = matchedCustomer?.email || lead.email || 'NA';
                  const displayLocation = matchedCustomer?.district || matchedCustomer?.address || lead.city || 'NA';`;

const isCRLF = code.includes('\r\n');
const normalizedTarget = isCRLF ? oldCardBlock.replace(/\n/g, '\r\n') : oldCardBlock.replace(/\r\n/g, '\n');
const normalizedReplacement = isCRLF ? newCardBlock.replace(/\n/g, '\r\n') : newCardBlock.replace(/\r\n/g, '\n');

if (code.includes(normalizedTarget)) {
  code = code.replace(normalizedTarget, normalizedReplacement);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully updated split view card block!');
} else {
  console.error('Target not found in WebQuotationManager');
}
