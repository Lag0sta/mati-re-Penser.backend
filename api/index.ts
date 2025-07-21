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
    await connectToDatabase(connStr)
    isConnected = true
  }

  return handler(req, res)
}
