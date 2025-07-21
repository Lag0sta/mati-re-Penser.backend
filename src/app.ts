import express from 'express';
import cors from 'cors';
import authRouter from './routes/auths';
import userRouter from './routes/users';
import topicRouter from './routes/topics';
import threadRouter from './routes/threads';
import uploadsRouter from './routes/uploads';

const app = express();

// CORS dynamique selon l'environnement
const corsOptions = {
  origin: '*',
  // process.env.NODE_ENV === 'production'
  //   ? process.env.FRONTEND_URL // ← remplace par ton vrai domaine
  //   : 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
console.log('CORS origin:', corsOptions.origin)
app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Bienvenue sur ton forum 👋');
});

app.use('/auths', authRouter);
app.use('/users', userRouter);
app.use('/topics', topicRouter)
app.use('/threads', threadRouter)
app.use('/uploads', uploadsRouter)


export default app;
