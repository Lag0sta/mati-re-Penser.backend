import express from 'express';
import cors from 'cors';

import adminRouter from './routes/admin';
import authRouter from './routes/auths';
import userRouter from './routes/users';
import topicRouter from './routes/topics';
import threadRouter from './routes/threads';
import uploadsRouter from './routes/uploads';
import reviewRouter from './routes/reviews';
import bookRouter from './routes/books';

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', (_req, res) => {
  res.send('Bienvenue sur ton forum 👋');
});

app.get('/test', (_req, res) => {
  res.send('Route test OK');
});

app.use('/admin', adminRouter);
app.use('/auths', authRouter);
app.use('/users', userRouter);
app.use('/topics', topicRouter);
app.use('/threads', threadRouter);
app.use('/uploads', uploadsRouter);
app.use('/reviews', reviewRouter);
app.use('/books', bookRouter);

export default app;
