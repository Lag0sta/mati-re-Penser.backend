import mongoose from 'mongoose';

export async function connectToDatabase(uri: string) {
  if (mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB déjà connecté (Mongoose)');
    return;
  }
  if (!uri) {
    throw new Error('La chaîne de connexion MongoDB est vide');
  }
  try {
    await mongoose.connect(uri, {connectTimeoutMS: 2000});
    console.log('✅ MongoDB connecté avec Mongoose');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    throw error;
  }
}
