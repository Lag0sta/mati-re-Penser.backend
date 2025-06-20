import express from 'express';
import cors from 'cors';
import userRoutes from './routes/users';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Bienvenue sur ton forum 👋');
});

app.use('/api/users', userRoutes);

export default app;
