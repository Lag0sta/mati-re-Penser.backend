import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase(uri: string) {
  if (isConnected) {
    console.log('✅ MongoDB déjà connecté (Mongoose)');
    return;
  }
  if (!uri) {
    throw new Error('La chaîne de connexion MongoDB est vide');
  }
  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log('✅ MongoDB connecté avec Mongoose');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    throw error;
  }
}
