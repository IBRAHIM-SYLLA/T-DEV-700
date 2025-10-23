import express from 'express';
import userRouter from './routes/UserRouter';
import AuthRouter from './routes/AuthRouter';

const app = express();
app.use(express.json());

app.get('/', (_, res) => {
    res.send('Hello Express + TypeScript 👋');
});

app.use('/api/users', userRouter);

app.use("/api/auth", AuthRouter);

export default app;