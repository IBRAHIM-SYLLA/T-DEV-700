import { IsNull } from "typeorm";
import { AppDataSource } from "../config/database";
import { ClockEntity } from "../models/Clock/ClockEntity";
import { UserEntity } from "../models/User/UserEntity";

export class ClockService {

    clockRepo = AppDataSource.getRepository(ClockEntity);
    userRepo = AppDataSource.getRepository(UserEntity);

    /**
     * POST /clocks
     * Pointer arrivée ou départ
     */
    async clockInOrOut(userId: number): Promise<ClockEntity> {
        const user = await this.userRepo.findOneBy({ user_id: userId });
        if (!user) {
            throw new Error("Utilisateur introuvable");
        }

        // Cherche un pointage sans départ
        const openClock = await this.clockRepo.findOne({
            where: {
                user: { user_id: userId },
                departure_time: IsNull()
            },
            relations: ["user"]
        });

        // ➜ Départ
        if (openClock) {
            openClock.departure_time = new Date();
            return await this.clockRepo.save(openClock);
        }

        // ➜ Arrivée
        const newClock = new ClockEntity();
        newClock.user = user;
        return await this.clockRepo.save(newClock);
    }

    /**
     * GET /users/:id/clocks
     */
    async getUserClocksSummary(userId: number): Promise<ClockEntity[]> {
        const user = await this.userRepo.findOneBy({ user_id: userId });
        if (!user) {
            throw new Error("Utilisateur introuvable");
        }

        return await this.clockRepo.find({
            where: {
                user: { user_id: userId }
            },
            order: {
                arrival_time: "DESC"
            }
        });
    }
}
