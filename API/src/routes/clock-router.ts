import express, { Router, Request, Response } from "express";
import { ClockService } from "../services/clock-service";

const clockRouter: Router = express.Router();
const clockService = new ClockService();

/**
 * @swagger
 * /api/clocks:
 *   post:
 *     summary: Create a clock
 *     tags: [Clocks]
 *     responses:
 *       201:
 *         description: Clock created
 */
clockRouter.post("/", async (req: Request, res: Response) => {
    try {
        // Ex: injecté par ton middleware JWT
        const userId: number = Number.parseInt(req.body.id);

        const clock = await clockService.clockInOrOut(userId);
        res.status(200).json(clock);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default clockRouter;
