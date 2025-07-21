import { VercelRequest, VercelResponse } from '@vercel/node'
import dotenv from 'dotenv'
import { MongoClient } from 'mongodb';
import app from '../src/app'
import { connectToDatabase } from '../src/models/connection'

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await getClient();
     res.setHeader('Content-Type', 'application/json');
    app(req as any, res as any);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
