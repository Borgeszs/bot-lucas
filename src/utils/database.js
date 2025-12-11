const { MongoClient } = require('mongodb');
let client;
let db;
module.exports = {
  connect: async () => {
    if (db) return db;
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.warn('MONGODB_URI not set — using in-memory shim (non-persistent).');
      return {
        collection: () => ({
          findOne: async () => null,
          find: () => ({ toArray: async () => [] }),
          updateOne: async () => ({}),
          deleteOne: async () => ({})
        })
      };
    }
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    return db;
  },
  close: async () => { if (client) await client.close(); }
};
