const fs = require('fs');
const leads = JSON.parse(fs.readFileSync('./src/data/leads.json', 'utf8'));
console.log('Total in leads.json:', leads.length);
leads.forEach(l => {
  console.log({
    id: l.id,
    phone: l.phone,
    equipment: l.equipment,
    doctorName: l.doctorName,
    time: l.time,
    date: l.date,
    quoteAmount: l.quoteAmount
  });
});

