const fs = require('fs');
const lines = fs.readFileSync('src/app/components/WebQuotationManager.jsx', 'utf8').split(/\r?\n/);
lines.forEach((l, i) => {
  if (
    l.includes('Complimentary Concession Desk') ||
    l.includes("activeMainTab === 'history'") ||
    l.includes("activeMainTab === 'complimentary'") ||
    l.includes('activeMainTab ===') ||
    l.includes('Complimentary Desk') ||
    l.includes('History')
  ) {
    if (l.length < 150) {
      console.log((i + 1) + ': ' + l.trim());
    }
  }
});

