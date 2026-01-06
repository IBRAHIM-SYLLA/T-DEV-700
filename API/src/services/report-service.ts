// services/ReportService.ts
import { AppDataSource } from "../config/database";
import { ClockEntity } from "../models/Clock/ClockEntity";
import { UserEntity } from "../models/User/UserEntity";
import { ReportKPI } from "../enums/report-kpi.enum";
import { ReportFilters } from "./types/report-filters";

export class ReportService {

    // 🔹 GLOBAL REPORT (pas de userId / teamId)
    static async getGlobalReport(
        kpis: ReportKPI[],
        from?: Date,
        to?: Date
    ) {
        const result: Record<string, any> = {};

        for (const kpi of kpis) {
            switch (kpi) {
                case ReportKPI.TOTAL_WORKED_TIME:
                    result.totalWorkedTime = await this.getTotalWorkedTime({ from, to });
                    break;

                case ReportKPI.AVERAGE_WORKED_TIME:
                    result.averageWorkedTime = await this.getAverageWorkedTime({ from, to });
                    break;

                case ReportKPI.LATE_RATE:
                    result.lateRate = await this.getLateRate({ from, to });
                    break;

                case ReportKPI.ACTIVE_USERS:
                    result.activeUsers = await this.getActiveUsers({ from, to });
                    break;

                case ReportKPI.INCOMPLETE_CLOCKS:
                    result.incompleteClocks = await this.getIncompleteClocks({ from, to });
                    break;
            }
        }

        return result;
    }

    // ⏱ Total worked time
    static async getTotalWorkedTime(filters: ReportFilters = {}) {
        const qb = AppDataSource
            .getRepository(ClockEntity)
            .createQueryBuilder("clock")
            .innerJoin("clock.user", "user")
            .where("clock.departure_time IS NOT NULL");

        if (filters.userId) {
            qb.andWhere("user.user_id = :userId", { userId: filters.userId });
        }

        if (filters.teamId) {
            qb.andWhere("user.team_id = :teamId", { teamId: filters.teamId });
        }

        if (filters.from) {
            qb.andWhere("clock.arrival_time >= :from", { from: filters.from });
        }

        if (filters.to) {
            qb.andWhere("clock.departure_time <= :to", { to: filters.to });
        }

        const clocks = await qb.getMany();

        return clocks.reduce(
            (total, c) =>
                total +
                (c.departure_time!.getTime() - c.arrival_time.getTime()),
            0
        ) / 3_600_000; // heures
    }


    // ⏱ Average worked time
    static async getAverageWorkedTime(filters: ReportFilters = {}) {
        const total = await this.getTotalWorkedTime(filters);
        const users = await this.getActiveUsers(filters);
        return users === 0 ? 0 : total / users;
    }

    // ⏰ Late rate
    static async getLateRate(filters: ReportFilters = {}) {
        const limitHour = 9;

        const qb = AppDataSource
            .getRepository(ClockEntity)
            .createQueryBuilder("clock")
            .innerJoin("clock.user", "user");

        if (filters.userId)
            qb.andWhere("user.user_id = :userId", { userId: filters.userId });

        if (filters.teamId)
            qb.andWhere("user.team_id = :teamId", { teamId: filters.teamId });

        const total = await qb.getCount();

        const late = await qb
            .andWhere("EXTRACT(HOUR FROM clock.arrival_time) >= :limitHour", {
                limitHour
            })
            .getCount();

        return total === 0 ? 0 : (late / total) * 100;
    }


    // 👤 Active users
    static async getActiveUsers(filters: ReportFilters = {}) {
        const qb = AppDataSource
            .getRepository(UserEntity)
            .createQueryBuilder("user")
            .innerJoin("user.clocks", "clock");

        if (filters.teamId) {
            qb.andWhere("user.team_id = :teamId", { teamId: filters.teamId });
        }

        if (filters.from) {
            qb.andWhere("clock.arrival_time >= :from", { from: filters.from });
        }

        if (filters.to) {
            qb.andWhere("clock.departure_time <= :to", { to: filters.to });
        }

        const users = await qb.getMany();
        return users.length;
    }


    // 🚨 Incomplete clocks
    static async getIncompleteClocks(filters: ReportFilters = {}) {
        const qb = AppDataSource
            .getRepository(ClockEntity)
            .createQueryBuilder("clock")
            .innerJoin("clock.user", "user")
            .where("clock.departure_time IS NULL");

        if (filters.userId) {
            qb.andWhere("user.user_id = :userId", { userId: filters.userId });
        }

        if (filters.teamId) {
            qb.andWhere("user.team_id = :teamId", { teamId: filters.teamId });
        }

        return qb.getCount();
    }

}
