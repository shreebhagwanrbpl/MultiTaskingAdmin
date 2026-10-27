import { MongoClient } from 'mongodb';

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/Website_Management';
const DEFAULT_DB = 'Website_Management';

let client;
let clientPromise;

function getClientPromise(customUri) {
  const uri = customUri || process.env.MONGODB_URI || DEFAULT_URI;

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise || global._mongoClientUri !== uri) {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        maxPoolSize: 20
      });
      global._mongoClientUri = uri;
      global._mongoClientPromise = client.connect().catch((err) => {
        global._mongoClientPromise = null;
        throw err;
      });
    }
    return global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 20
    });
    return client.connect();
  }
}

export default getClientPromise;

export async function getDatabase(customUri, customDbName) {
  const promise = getClientPromise(customUri);
  const client = await promise;
  const dbName = customDbName || process.env.MONGODB_DB || DEFAULT_DB;
  return client.db(dbName);
}

export async function testMongoConnection(uriToTest) {
  const uri = uriToTest || process.env.MONGODB_URI || DEFAULT_URI;
  const startTime = Date.now();
  const testClient = new MongoClient(uri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });

  try {
    await testClient.connect();
    const dbName = process.env.MONGODB_DB || DEFAULT_DB;
    const db = testClient.db(dbName);
    const pingResult = await db.command({ ping: 1 });
    const latency = Date.now() - startTime;

    // Fetch collections and document counts
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    let siteCount = 0;
    let leadCount = 0;
    let campaignCount = 0;
    let productCount = 0;

    if (collectionNames.includes('sites')) {
      siteCount = await db.collection('sites').countDocuments();
    }
    if (collectionNames.includes('leads')) {
      leadCount = await db.collection('leads').countDocuments();
    }
    if (collectionNames.includes('campaigns')) {
      campaignCount = await db.collection('campaigns').countDocuments();
    }
    if (collectionNames.includes('products')) {
      productCount = await db.collection('products').countDocuments();
    }

    await testClient.close();

    return {
      success: true,
      connected: true,
      ping: pingResult,
      latency: `${latency}ms`,
      database: dbName,
      uri: uri.replace(/:([^:@]+)@/, ':****@'), // redact password for security
      counts: {
        sites: siteCount,
        leads: leadCount,
        campaigns: campaignCount,
        products: productCount
      },
      collections: collectionNames
    };
  } catch (error) {
    try {
      await testClient.close();
    } catch {}
    return {
      success: false,
      connected: false,
      error: error.message || 'Failed to connect to MongoDB cluster',
      uri: uri.replace(/:([^:@]+)@/, ':****@')
    };
  }
}
