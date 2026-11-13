const fs = require('fs');
const { MongoClient } = require('mongodb');

const envFile = fs.readFileSync('.env.local', 'utf8');
const m = envFile.match(/MONGODB_URI=(.+)/);
const uri = m ? m[1].trim() : '';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('Website_Management');
  
  const leads = await db.collection('leads').find({
    $or: [
      { id: /2388/ },
      { 'rawLeadData.quoteNumber': /2388/ },
      { equipment: /RajScan/i }
    ]
  }).toArray();

  console.log('Found leads:', leads.length);
  for (const l of leads) {
    console.log({
      id: l.id,
      equipment: l.equipment,
      status: l.status,
      isQuotationCreated: l.isQuotationCreated,
      quotationRef: l.quotationRef,
      rawQuoteNumber: l.rawLeadData?.quoteNumber,
      rawStatus: l.rawLeadData?.status,
      rawQuotationRef: l.rawLeadData?.quotationRef
    });
  }

  // Also check quotations collection
  const quotes = await db.collection('quotations').find({
    $or: [
      { 'items.name': /RajScan/i },
      { refNo: /561/ }
    ]
  }).toArray();
  console.log('Found quotes:', quotes.length);
  for (const q of quotes) {
    console.log({
      id: q.id,
      refNo: q.refNo,
      customer: q.customer?.hospitalName,
      items: q.items?.map(it => it.name)
    });
  }

  await client.close();
}

main().catch(console.error);

