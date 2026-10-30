const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/app/preview/[domain]/page.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. State
const stateRegex = /const \[rfqQuantity, setRfqQuantity\] = useState\('1 Unit'\);\r?\n\s*const \[rfqSubmitting, setRfqSubmitting\] = useState\(false\);\r?\n\s*const \[rfqSuccess, setRfqSuccess\] = useState\(false\);/;
const newState = `const [rfqQuantity, setRfqQuantity] = useState('1');
  const [rfqExpectedPrice, setRfqExpectedPrice] = useState('');
  const [rfqCustomerNote, setRfqCustomerNote] = useState('');
  const [rfqSubmitting, setRfqSubmitting] = useState(false);
  const [rfqSuccess, setRfqSuccess] = useState(false);`;

if (stateRegex.test(content)) {
  content = content.replace(stateRegex, newState);
  console.log('1. Replaced state with regex');
} else {
  console.log('1. State already replaced or not found');
}

// 2. openRfqModal
const openRfqRegex = /const openRfqModal = \(prod\) => \{\r?\n\s*setRfqProduct\(prod\);\r?\n\s*setRfqSuccess\(false\);\r?\n\s*setRfqModalOpen\(true\);\r?\n\s*\};/;
const newOpenRfq = `const openRfqModal = (prod) => {
    setRfqProduct(prod);
    setRfqSuccess(false);
    const basePrice = prod?.price || 150000;
    setRfqExpectedPrice(String(basePrice));
    setRfqQuantity('1');
    setRfqCustomerNote('');
    setRfqModalOpen(true);
  };`;

if (openRfqRegex.test(content)) {
  content = content.replace(openRfqRegex, newOpenRfq);
  console.log('2. Replaced openRfqModal with regex');
} else {
  console.log('2. openRfqModal already replaced or not found');
}

// 3. handleRfqSubmit start
const submitStartRegex = /const leadPrice = rfqProduct\?\.price \|\| 150000;\r?\n\s*const numQty = parseInt\(String\(rfqQuantity \|\| '1'\)\.replace\(\/\\D\/g, ''\), 10\) \|\| 1;\r?\n\s*const itemTotal = leadPrice \* numQty;/;
const newSubmitStart = `const catalogUnitPrice = rfqProduct?.price || 150000;
    const numQty = parseInt(String(rfqQuantity || '1').replace(/\\D/g, ''), 10) || 1;
    const parsedOfferPrice = parseFloat(String(rfqExpectedPrice || '').replace(/[^0-9.]/g, '')) || catalogUnitPrice;
    const isPriceNegotiated = parsedOfferPrice < catalogUnitPrice;
    const itemTotal = parsedOfferPrice * numQty;
    const actualTotal = catalogUnitPrice * numQty;
    const leadPrice = parsedOfferPrice;`;

if (submitStartRegex.test(content)) {
  content = content.replace(submitStartRegex, newSubmitStart);
  console.log('3. Replaced submit start with regex');
} else {
  console.log('3. submit start already replaced or not found');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done patching preview page.');

