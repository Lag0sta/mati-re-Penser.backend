import { VercelRequest, VercelResponse } from '@vercel/node'
import dotenv from 'dotenv'
import app from '../src/app'
import { connectToDatabase } from '../src/models/connection'
import serverless from 'serverless-http'

dotenv.config()

let isConnected = false

const handler = serverless(app)

export default async function (req: VercelRequest, res: VercelResponse) {
  if (!isConnected) {
    const connStr = process.env.CONNECTION_STRING || ''
    console.log('🚀 Tentative de connexion à la DB avec:', connStr)

    try {
      await connectToDatabase(connStr)
      isConnected = true
      console.log('✅ Data Connected')
    } catch (error) {
      console.error('❌ Erreur de connexion à la DB:', error)
      // On répond avec une erreur 500 pour éviter le timeout
      return res.status(500).json({ error: 'Impossible de se connecter à la base de données' })
    }
  }


  return handler(req, res)
}
