import { UserModel } from "./user.model";

export class TeamModel {
    team_id!: number;
    name!: string;
    description!: string;
    manager_id!: number;
    manager!: UserModel;
    members!: UserModel[];
}