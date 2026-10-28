const { MongoClient } = require('mongodb');

const uri = 'mongodb://rajbiosis15_db_user:R7jmlgZ3RfeB0MEz@ac-xdnyrrg-shard-00-00.aneatej.mongodb.net:27017,ac-xdnyrrg-shard-00-01.aneatej.mongodb.net:27017,ac-xdnyrrg-shard-00-02.aneatej.mongodb.net:27017/Website_Management?ssl=true&replicaSet=atlas-c27e2k-shard-0&authSource=admin&retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('Website_Management');

  // Delete all quotations where customerName contains 'healthcare institution' or 'jaipur health'
  const resQuotes = await db.collection('quotations').deleteMany({
    $or: [
      { customerName: { $regex: 'healthcare institution', $options: 'i' } },
      { customerName: { $regex: 'health institute', $options: 'i' } },
      { customerName: { $regex: 'jaipur health', $options: 'i' } }
    ]
  });
  console.log('Deleted dummy quotations from MongoDB:', resQuotes.deletedCount);

  // Delete all leads where hospital contains 'healthcare institution' or 'health institute'
  const resLeads = await db.collection('leads').deleteMany({
    $or: [
      { hospital: { $regex: 'healthcare institution', $options: 'i' } },
      { hospital: { $regex: 'health institute', $options: 'i' } },
      { 'rawLeadData.hospitalName': { $regex: 'healthcare institution', $options: 'i' } }
    ]
  });
  console.log('Deleted dummy leads from MongoDB:', resLeads.deletedCount);

  await client.close();
}

main().catch(console.error);
