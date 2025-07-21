import { VercelRequest, VercelResponse } from '@vercel/node'
import dotenv from 'dotenv'
import app from '../src/app'
import { connectToDatabase } from '../src/models/connection'
import serverless from 'serverless-http'

dotenv.config()

const handler = serverless(app)

export default async function (req: VercelRequest, res: VercelResponse) {
  console.log('➡️ Requête reçue:', req.method, req.url)

  const connStr = process.env.CONNECTION_STRING

  if (!connStr) {
    console.error('❌ CONNECTION_STRING est manquante ou vide')
    return res.status(500).json({ error: 'CONNECTION_STRING manquante' })
  }

  try {
    await connectToDatabase(connStr)
    console.log('✅ Connexion DB OK')
  } catch (error) {
    console.error('❌ Erreur de connexion à la DB:', error)
    return res.status(500).json({ error: 'Impossible de se connecter à la base de données' })
  }

  try {
    return handler(req, res)
  } catch (err) {
    console.error('❌ Erreur dans handler:', err)
    return res.status(500).json({ error: 'Erreur interne' })
  }
}
