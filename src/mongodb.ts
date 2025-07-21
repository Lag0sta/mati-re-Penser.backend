import { MongoClient, Db } from 'mongodb';

const uri = process.env.CONNECTION_STRING;
if (!uri) {
  throw new Error('La variable d’environnement CONNECTION_STRING est manquante.');
}

const client = new MongoClient(uri);

let clientPromise: Promise<MongoClient> | null = null;

export async function connectToDB(): Promise<MongoClient> {
  if (!clientPromise) {
    console.log('🔌 Connexion à MongoDB...');
    clientPromise = client.connect();
    await clientPromise;
    console.log('✅ Connexion MongoDB établie !');
  }
  return clientPromise;
}

export function getDbInstance(dbName = "your-db-name"): Db {
  if (!clientPromise) {
    throw new Error("DB not connected yet");
  }
  return client.db(dbName);
}
