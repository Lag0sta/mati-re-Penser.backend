import dotenv from 'dotenv';
import app from './app';
import { connectToDatabase } from './models/connection';

dotenv.config();

const string = process.env.CONNECTION_STRING || '';

connectToDatabase(string).then(() => {
  app.listen(4000, () => {
    console.log(`🚀 Server running on http://localhost:4000`);
  });
});
