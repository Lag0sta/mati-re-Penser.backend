import { VercelRequest, VercelResponse } from '@vercel/node'
import serverless from 'serverless-http';
import dotenv from 'dotenv'
import { MongoClient } from 'mongodb';
import app from '../src/app'

dotenv.config()


  const connStr = process.env.CONNECTION_STRING || ''
  const client = new MongoClient(connStr)
  let clientPromise: Promise<MongoClient> | null = null;

async function getClient() {
  if (!clientPromise) {
    clientPromise = client.connect();
  }
  return clientPromise;
}

await getClient(); // Assure la connexion au lancement (optionnel, mais plus propre)

const handler = serverless(app);

export default handler;