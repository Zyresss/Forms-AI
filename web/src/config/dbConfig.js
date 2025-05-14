import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const url = 'mongodb://localhost:27017' || process.env.DB_URL;
const dbName = 'mydb' || process.env.DB_NAME;

let db;

export async function connectToDB() {
  const client = await MongoClient.connect(url);
  console.log('Connected to MongoDB');
  db = client.db(dbName);
}

export function getDB() {
  if (!db) {
    throw new Error('Database not connected!');
  }
  return db;
}