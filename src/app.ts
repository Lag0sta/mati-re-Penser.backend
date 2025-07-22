import express from 'express';
import cors from 'cors';
import { connectToDB } from './mongodb';

import authRouter from './routes/auths';
import userRouter from './routes/users';
import topicRouter from './routes/topics';
import threadRouter from './routes/threads';
import uploadsRouter from './routes/uploads';
import { connect } from 'http2';

const app = express();

app.use(cors());
app.use(express.json());



app.get('/', (_req, res) => {
  res.send('Bienvenue sur ton forum 👋');
});

app.get('/test', (_req, res) => {
  res.send('Route test OK');
});

// Connexion MongoDB une seule fois au démarrage
connectToDB();

app.use('/auths', authRouter);
app.use('/users', userRouter);
app.use('/topics', topicRouter);
app.use('/threads', threadRouter);
app.use('/uploads', uploadsRouter);

export default app;
