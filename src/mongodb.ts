import mongoose from 'mongoose';

const uri = process.env.CONNECTION_STRING!;
let isConnected = false;

export async function connectToDB() {
  if (isConnected) {
    console.log('✅ MongoDB déjà connecté (Mongoose)');
    return;
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

export default connectToDB;