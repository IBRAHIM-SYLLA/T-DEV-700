import express from 'express';
import cors from 'cors';
import userRouter from './routes/UserRouter';
import AuthRouter from './routes/AuthRouter';
import teamRouter from './routes/TeamRouter';
import clockRouter from './routes/ClockRouter';
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

const app = express();
app.use(express.json());

const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0) return callback(null, true);
        return callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

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