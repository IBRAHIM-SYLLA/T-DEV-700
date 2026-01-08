// routes/ReportRouter.ts
import express from "express";
import { ReportKPI } from "../enums/report-kpi.enum";
import { ReportService } from "../services/report-service";
import { verifyManager, verifyToken } from "../utils/UserMiddleware";

const reportRouter = express.Router();

const parseFilters = (query: any) => ({
    userId: query.userId ? Number(query.userId) : undefined,
    teamId: query.teamId ? Number(query.teamId) : undefined,
    from: query.from ? new Date(query.from) : undefined,
    to: query.to ? new Date(query.to) : undefined
});

/**
 * 🌍 Global report (NO userId / teamId)
 */
reportRouter.get("/", verifyToken, verifyManager, async (req, res) => {
    const { kpis, from, to } = req.query;

    if (!kpis) {
        return res.status(400).json({ message: "kpis query param is required" });
    }

    const parsedKpis = (kpis as string)
        .split(",")
        .filter(k => Object.values(ReportKPI).includes(k as ReportKPI)) as ReportKPI[];

    const report = await ReportService.getGlobalReport(
        parsedKpis,
        from ? new Date(from as string) : undefined,
        to ? new Date(to as string) : undefined
    );

    res.json(report);
});

/**
 * KPI routes (WITH filters)
 */
reportRouter.get("/total-worked-time", verifyToken, verifyManager, async (req, res) => {
    res.json({
        totalWorkedTime: await ReportService.getTotalWorkedTime(parseFilters(req.query))
    });
});

reportRouter.get("/average-worked-time", verifyToken, verifyManager, async (req, res) => {
    res.json({
        averageWorkedTime: await ReportService.getAverageWorkedTime(parseFilters(req.query))
    });
});

reportRouter.get("/late-rate", verifyToken, verifyManager, async (req, res) => {
    res.json({
        lateRate: await ReportService.getLateRate(parseFilters(req.query))
    });
});

reportRouter.get("/active-users", verifyToken, verifyManager, async (req, res) => {
    res.json({
        activeUsers: await ReportService.getActiveUsers(parseFilters(req.query))
    });
});

reportRouter.get("/incomplete-clocks", verifyToken, verifyManager, async (req, res) => {
    res.json({
        incompleteClocks: await ReportService.getIncompleteClocks(parseFilters(req.query))
    });
});

export default reportRouter;
