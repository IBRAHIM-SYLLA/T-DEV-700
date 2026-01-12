import dotenv from 'dotenv';
import path from "path";
import { DataSource } from "typeorm";
import "reflect-metadata";
import { UserEntity } from "../models/User/UserEntity";
import { TeamEntity } from "../models/Team/TeamEntity";
import { ClockEntity } from "../models/Clock/ClockEntity";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const AppDataSource = new DataSource({
    type: "mariadb",
    url: "mysql://root:MILvoKFwVIKsKwyBbFgVlaGuilTmTaUo@metro.proxy.rlwy.net:51660/railway",

    synchronize: false,
    logging: true,

    entities: [UserEntity, TeamEntity, ClockEntity],
    migrations: [],
});
