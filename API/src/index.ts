import express from 'express';
import cors from 'cors'; 
import userRouter from './routes/user-router';
import AuthRouter from './routes/auth-router';
import teamRouter from './routes/team-router';
import clockRouter from './routes/clock-router';
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./swagger";
import reportRouter from './routes/report-router';

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

app.get('/', (_, res) => {
    res.send('Time Manager API is running');
});

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/users', userRouter);

app.use("/api/auth", AuthRouter);

app.use("/api/teams", teamRouter);

app.use("/api/clocks", clockRouter);

app.use("/api/reports", reportRouter);

export default app;