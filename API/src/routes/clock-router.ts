import express, { Router, Request, Response } from "express";
import { ClockService } from "../services/clock-service";
import { verifyToken } from "../utils/UserMiddleware";

const clockRouter: Router = express.Router();
const clockService = new ClockService();

clockRouter.post("/", verifyToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;

        const clock = await clockService.clockInOrOut(userId);
        res.status(200).json(clock);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});


export default clockRouter;
