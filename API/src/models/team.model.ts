import { PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, Entity } from "typeorm";
import { UserModel } from "./user.model";

@Entity("teams")
export class TeamModel {
    @PrimaryGeneratedColumn()
    team_id!: number;

    @Column()
    name!: string;

    @Column({ nullable: true })
    description!: string;

    // Relation vers le manager (un user)
    @ManyToOne(() => UserModel, { nullable: true })
    @JoinColumn({ name: "manager_id" })
    manager!: UserModel | null;

    // Relation inverse users → team
    @OneToMany(() => UserModel, user => user.team)
    members!: UserModel[];
}