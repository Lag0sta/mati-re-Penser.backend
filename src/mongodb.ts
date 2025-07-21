import { MongoClient } from 'mongodb';

const uri = process.env.CONNECTION_STRING!;
const client = new MongoClient(uri);

let clientPromise: Promise<MongoClient> | null = null;

export async function connectToDB(): Promise<MongoClient> {
  if (!clientPromise) {
    console.log('🔌 Connexion à MongoDB...');
    clientPromise = client.connect();
  }
  return clientPromise;
}

export function getDbInstance() {
  if (!clientPromise) {
    throw new Error("DB not connected yet");
  }
  return client.db("your-db-name"); // change le nom de ta DB ici
}