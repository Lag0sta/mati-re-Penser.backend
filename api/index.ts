import { VercelRequest, VercelResponse } from '@vercel/node'
import serverless from 'serverless-http';
import dotenv from 'dotenv'
import { MongoClient } from 'mongodb';
import app from '../src/app'

dotenv.config()


  const connStr = process.env.CONNECTION_STRING || ''
  const client = new MongoClient(connStr)
  let clientPromise: Promise<MongoClient> | null = null;


// 👇 Connexion MongoDB – garantie de Promise
async function getClient(): Promise<MongoClient> {
  if (!clientPromise) {
    console.log('🔌 Connexion à MongoDB...');
    clientPromise = client.connect();
  }
  return clientPromise;
}


// 👇 Prépare le handler Express
const handler = serverless(app);


// 👇 Fonction handler exportée à Vercel
export default async function vercelHandler(req: any, res: any) {
  console.log('📥 Requête entrante :', req.method, req.url);
  try {
    await getClient(); // ⏳ Assure que Mongo est connecté
    return handler(req, res); // 🚀 Lance Express
  } catch (err) {
    console.error('❌ Erreur dans la fonction API :', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}