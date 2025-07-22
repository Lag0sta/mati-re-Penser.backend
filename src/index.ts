import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectToDatabase } from './mongodb'; // ou './models/connection' selon ton arborescence

const uri = process.env.CONNECTION_STRING || '';

const start = async () => {
  try {
    await connectToDatabase(uri);  // <-- passer la chaîne ici
    app.listen(4000, () => {
      console.log('🚀 Server running on http://localhost:4000');
    });
  } catch (error) {
    console.error('❌ Erreur lors de la connexion à la DB', error);
  }
};

start();
