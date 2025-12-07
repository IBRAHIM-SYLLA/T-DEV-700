import express from 'express';
import userRouter from './routes/UserRouter';
import AuthRouter from './routes/AuthRouter';
import teamRouter from './routes/TeamRouter';

const app = express();
app.use(express.json());

app.get('/', (_, res) => {
    res.send('Time Manager API is running');
});

app.use('/api/users', userRouter);

app.use("/api/auth", AuthRouter);

app.use("/api/teams", teamRouter);

export default app;