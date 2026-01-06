import express from 'express';
import userRouter from './routes/UserRouter';
import AuthRouter from './routes/AuthRouter';
import teamRouter from './routes/TeamRouter';
import clockRouter from './routes/ClockRouter';
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

const app = express();
app.use(express.json());

app.get('/', (_, res) => {
    res.send('Time Manager API is running');
});

// Swagger
console.log("✅ Swagger middleware registered");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/users', userRouter);

app.use("/api/auth", AuthRouter);

app.use("/api/teams", teamRouter);

app.use("/api/clocks/", clockRouter)

export default app;