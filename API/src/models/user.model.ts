import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TeamModel } from "./team.model";

@Entity("users")
export class UserModel {
    @PrimaryGeneratedColumn()
    user_id!: number;

    @Column()
    first_name!: string;

    @Column()
    last_name!: string;

    @Column()
    email!: string;

    @Column()
    phone_number!: string;

    @Column()
    password!: string;

    @Column({
        type: "enum",
        enum: ["super_admin", "manager", "employee"]
    })
    role!: "super_admin" | "manager" | "employee";

    @ManyToOne(() => TeamModel, team => team.members, {
        nullable: true,
        onDelete: "SET NULL"
    })
    @JoinColumn({ name: "team_id" })
    team!: TeamModel | null;

    @OneToMany(() => TeamModel, team => team.manager)
    managed_teams!: TeamModel[];
}