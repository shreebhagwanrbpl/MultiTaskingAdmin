const { MongoClient } = require('mongodb');

const uri = 'mongodb://rajbiosis15_db_user:R7jmlgZ3RfeB0MEz@ac-xdnyrrg-shard-00-00.aneatej.mongodb.net:27017,ac-xdnyrrg-shard-00-01.aneatej.mongodb.net:27017,ac-xdnyrrg-shard-00-02.aneatej.mongodb.net:27017/Website_Management?ssl=true&replicaSet=atlas-c27e2k-shard-0&authSource=admin&retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('Website_Management');

  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    const docs = await db.collection(col.name).find({
      $or: [
        { doctorName: /Satym/i },
        { customerName: /Satym/i },
        { fullName: /Satym/i },
        { phone: /8547512632/ },
        { customerPhone: /8547512632/ },
        { email: /jaatsatym/i },
        { customerEmail: /jaatsatym/i },
        { hospital: /Balaji/i },
        { hospitalName: /Balaji/i },
        { customerName: /Balaji/i }
      ]
    }).toArray();
    if (docs.length > 0) {
      console.log(`Collection: ${col.name}, Count: ${docs.length}`);
      docs.forEach(d => console.log(JSON.stringify(d, null, 2)));
    }
  }

  await client.close();
}

main().catch(console.error);
