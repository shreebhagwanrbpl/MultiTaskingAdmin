const fs = require('fs');
const lines = fs.readFileSync('src/app/components/WebQuotationManager.jsx', 'utf8').split(/\r?\n/);
lines.forEach((l, i) => {
  if (l.includes('hospitalName')) {
    console.log(`${i + 1}: ${l.trim()}`);
  }
});

