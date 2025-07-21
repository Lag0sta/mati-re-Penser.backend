import express from 'express';
import cors from 'cors';
import { connectToDB } from './mongodb';

import authRouter from './routes/auths';
import userRouter from './routes/users';
import topicRouter from './routes/topics';
import threadRouter from './routes/threads';
import uploadsRouter from './routes/uploads';

const app = express();


app.use(cors());
app.use(express.json());

// Connexion MongoDB une fois au démarrage
(async () => {
  try {
    await connectToDB();
    console.log('MongoDB connecté au démarrage');
  } catch (err) {
    console.error('Erreur connexion MongoDB au démarrage :', err);
    process.exit(1); // Ou gérer autrement l’erreur critique
  }
})();

app.get('/', (_req, res) => {
  res.send('Bienvenue sur ton forum 👋');
});

app.get('/test', (_req, res) => {
  res.send('Route test OK');
});

app.use('/auths', authRouter);
app.use('/users', userRouter);
app.use('/topics', topicRouter)
app.use('/threads', threadRouter)
app.use('/uploads', uploadsRouter)


export default app;
