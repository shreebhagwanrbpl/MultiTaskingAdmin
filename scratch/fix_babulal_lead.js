const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://rajbiosis15_db_user:R7jmlgZ3RfeB0MEz@ac-xdnyrrg-shard-00-00.aneatej.mongodb.net:27017,ac-xdnyrrg-shard-00-01.aneatej.mongodb.net:27017,ac-xdnyrrg-shard-00-02.aneatej.mongodb.net:27017/Website_Management?ssl=true&replicaSet=atlas-c27e2k-shard-0&authSource=admin&retryWrites=true&w=majority';

function isDummy(str) {
  if (!str || typeof str !== 'string') return true;
  const l = str.trim().toLowerCase();
  return (
    !l ||
    l === 'na' ||
    l === 'n/a' ||
    l.includes('healthcare institution') ||
    l.includes('healthcare center') ||
    l.includes('healthcare facility') ||
    l.includes('health institute') ||
    l.includes('customer hospital') ||
    l === 'hospital / healthcare center' ||
    l === 'general hospital' ||
    l === 'clinic / hospital' ||
    l === 'hospital'
  );
}

// 1. Clean JSON
const leadsPath = path.join(process.cwd(), 'src', 'data', 'leads.json');
let leads = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));
leads.forEach(l => {
  if (isDummy(l.hospital)) {
    l.hospital = 'NA';
  }
  if (isDummy(l.hospitalName)) {
    l.hospitalName = 'NA';
  }
  if (l.rawLeadData) {
    if (isDummy(l.rawLeadData.hospitalName)) {
      l.rawLeadData.hospitalName = 'NA';
    }
  }
});
fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2), 'utf8');
console.log('Cleaned src/data/leads.json');

// 2. Clean MongoDB
async function cleanMongo() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('Website_Management');

  const mongoLeads = await db.collection('leads').find({}).toArray();
  for (const l of mongoLeads) {
    if (isDummy(l.hospital) || isDummy(l.hospitalName) || (l.rawLeadData && isDummy(l.rawLeadData.hospitalName))) {
      await db.collection('leads').updateOne(
        { _id: l._id },
        {
          $set: {
            hospital: 'NA',
            hospitalName: 'NA',
            'rawLeadData.hospitalName': 'NA'
          }
        }
      );
    }
  }
  console.log('Cleaned MongoDB leads collection');
  await client.close();
}

cleanMongo().catch(console.error);

