import { MongoClient } from 'mongodb';

const DEFAULT_URI = 'mongodb://rajbiosis15_db_user:R7jmlgZ3RfeB0MEz@ac-xdnyrrg-shard-00-00.aneatej.mongodb.net:27017,ac-xdnyrrg-shard-00-01.aneatej.mongodb.net:27017,ac-xdnyrrg-shard-00-02.aneatej.mongodb.net:27017/Website_Management?ssl=true&replicaSet=atlas-c27e2k-shard-0&authSource=admin&retryWrites=true&w=majority';
const DEFAULT_DB = 'Website_Management';

export function normalizeMongoUri(rawUri) {
  if (!rawUri) return DEFAULT_URI;
  const trimmed = rawUri.trim();
  // Automatically convert problematic Windows SRV to direct 3-node seedlist
  if (trimmed.startsWith('mongodb+srv://') && trimmed.includes('superadminrbpl.aneatej.mongodb.net')) {
    const match = trimmed.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@superadminrbpl\.aneatej\.mongodb\.net(?:\/([^?]+))?/);
    if (match) {
      const user = match[1];
      const pass = match[2];
      const db = match[3] || 'Website_Management';
      return `mongodb://${user}:${pass}@ac-xdnyrrg-shard-00-00.aneatej.mongodb.net:27017,ac-xdnyrrg-shard-00-01.aneatej.mongodb.net:27017,ac-xdnyrrg-shard-00-02.aneatej.mongodb.net:27017/${db}?ssl=true&replicaSet=atlas-c27e2k-shard-0&authSource=admin&retryWrites=true&w=majority`;
    }
  }
  return trimmed;
}

let client;
let clientPromise;

function getClientPromise(customUri) {
  const uri = normalizeMongoUri(customUri || process.env.MONGODB_URI);

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
  const uri = normalizeMongoUri(uriToTest || process.env.MONGODB_URI);
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
