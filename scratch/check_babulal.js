const { MongoClient } = require('mongodb');
const uri = 'mongodb://rajbiosis15_db_user:R7jmlgZ3RfeB0MEz@ac-xdnyrrg-shard-00-00.aneatej.mongodb.net:27017,ac-xdnyrrg-shard-00-01.aneatej.mongodb.net:27017,ac-xdnyrrg-shard-00-02.aneatej.mongodb.net:27017/Website_Management?ssl=true&replicaSet=atlas-c27e2k-shard-0&authSource=admin&retryWrites=true&w=majority';

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('Website_Management');
  const bLead = await db.collection('leads').findOne({
    $or: [{ doctorName: /Babulal/i }, { phone: /8547965213/ }]
  });
  console.log('Babulal in MongoDB leads:', bLead ? { id: bLead.id, doc: bLead.doctorName, hosp: bLead.hospital } : 'Not found');
  const bCust = await db.collection('customers').findOne({
    $or: [{ fullName: /Babulal/i }, { phone: /8547965213/ }]
  });
  console.log('Babulal in MongoDB customers:', bCust ? { id: bCust.id, name: bCust.fullName, hosp: bCust.hospitalName } : 'Not found');
  await client.close();
}

run().catch(console.error);

