const fs = require('fs');
const filePath = 'src/app/components/WebQuotationManager.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const isCRLF = content.includes('\r\n');
let norm = content.replace(/\r\n/g, '\n');

// 1. Add const hospitalName = finalCustomerName; right after finalCustomerName
const targetDef = `    const finalCustomerName = (cleanHospitalName && cleanHospitalName !== 'NA') ? cleanHospitalName : (docName || 'NA');
    setCustomerName(finalCustomerName);`;

const replaceDef = `    const finalCustomerName = (cleanHospitalName && cleanHospitalName !== 'NA') ? cleanHospitalName : (docName || 'NA');
    const hospitalName = finalCustomerName;
    setCustomerName(finalCustomerName);`;

if (norm.includes(targetDef)) {
  norm = norm.replace(targetDef, replaceDef);
  console.log('Added const hospitalName = finalCustomerName');
} else {
  console.log('targetDef not found');
}

// 2. Also ensure line 2102 uses finalCustomerName safely
norm = norm.replace(
  'Ready for ${hospitalName}!',
  'Ready for ${finalCustomerName}!'
);
console.log('Replaced toast string with finalCustomerName');

const result = isCRLF ? norm.replace(/\n/g, '\r\n') : norm;
fs.writeFileSync(filePath, result, 'utf8');
console.log('Saved changes.');

