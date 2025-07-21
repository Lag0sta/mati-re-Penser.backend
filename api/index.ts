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

const serverlessHandler = serverless(app);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await getClient();
        return serverlessHandler(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
