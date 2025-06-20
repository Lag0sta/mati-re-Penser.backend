import mongoose from 'mongoose';

export async function connectToDatabase(connectionString: string): Promise<typeof mongoose | Error> {
  try {
    await mongoose.connect(connectionString, { connectTimeoutMS: 2000 });
    console.log('✅ Data Connected');
    return mongoose;
  } catch (error) {
    console.error('❌ Error connection failed:', error);
    return error as Error;
  }
}
