import express from 'express';
import userRouter from './routes/UserRouter';

const app = express();
app.use(express.json());

app.get('/', (_, res) => {
    res.send('Hello Express + TypeScript 👋');
});

app.use('/api/users', userRouter);

export default app;