const { MongoClient } = require('mongodb');
require('dotenv').config();

const url = 'mongodb://localhost:27017' || process.send.DB_URL;
const dbName = 'mydb' || process.env.DB_NAME;

let db;

async function connectToDB() {
  const client = await MongoClient.connect(url);
  console.log('Connected to MongoDB');
  db = client.db(dbName);
}

function getDB() {
  if (!db) {
    throw new Error('Database not connected!');
  }
  return db;
}

module.exports = {
  connectToDB,
  getDB,
};