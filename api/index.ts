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


const handler = serverless(app);

export default async function vercelHandler(req: any, res: any) {
  try {
    await getClient(); // 👈 ICI, à l'intérieur d'une fonction async = OK
    return handler(req, res); // 👈 handler Express
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}