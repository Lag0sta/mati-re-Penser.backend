import express from 'express';
import cors from 'cors';
import userRouter from './routes/users';
import submitRouter from './routes/submits';
import uploadsRouter from './routes/uploads';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Bienvenue sur ton forum 👋');
});

app.use('/users', userRouter);
app.use('/submits', submitRouter)
app.use('/uploads', uploadsRouter)


export default app;
