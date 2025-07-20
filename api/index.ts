import app from '../src/app'
import { connectToDatabase } from '../src/models/connection'
import { VercelRequest, VercelResponse } from '@vercel/node'
import dotenv from 'dotenv'

dotenv.config()

let isConnected = false

function runMiddleware(req: VercelRequest, res: VercelResponse) {
  return new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      resolve()
    })
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isConnected) {
    const connStr = process.env.CONNECTION_STRING || ''
    await connectToDatabase(connStr)
    isConnected = true
  }

  try {
    await runMiddleware(req, res)
  } catch (error) {
    console.error('Error in Express handler:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
