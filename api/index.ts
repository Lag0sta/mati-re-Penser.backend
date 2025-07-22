import dotenv from 'dotenv';
dotenv.config();

import serverless from 'serverless-http';
import app from '../src/app';
import { connectToDatabase } from '../src/mongodb';

const uri = process.env.CONNECTION_STRING || '';

// On connecte la DB une seule fois au premier appel, 
// pour éviter de reconnecter à chaque invocation serverless

let isConnected = false;

const handler = async (req: any, res: any) => {
  if (!isConnected) {
    try {
      await connectToDatabase(uri);
      isConnected = true;
    } catch (error) {
      console.error('❌ Erreur lors de la connexion à la DB dans Vercel', error);
      res.status(500).send('Erreur serveur');
      return;
    }
  }
  return app(req, res);
};

export default handler;
