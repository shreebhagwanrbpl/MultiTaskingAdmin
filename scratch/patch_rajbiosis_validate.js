const fs = require('fs');
const filePath = 'C:\\Users\\Admin\\Documents\\GitHub\\rajbiosis.com\\src\\components\\ProductEnquiryModal.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = /const validateForm = \(\) => \{\r?\n\s*const cleanDigits = phone\.replace\(/;
const replacement = `const validateForm = () => {
    if (product?.isNegotiable) {
      const numExpected = parseFloat(String(expectedPrice || '').replace(/[^0-9.]/g, ''));
      if (!numExpected || numExpected <= 0) {
        return 'Yeh product Negotiable hai! Kripya submit karne se pehle apna Target / Expected Offer Price (₹) daalein.';
      }
    }
    const cleanDigits = phone.replace(`;

if (target.test(content) && !content.includes('Yeh product Negotiable hai!')) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Added negotiable validation to validateForm in ProductEnquiryModal.jsx');
} else {
  console.log('Already added or not matched');
}

