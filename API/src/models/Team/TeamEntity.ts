import { PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, Entity } from "typeorm";
import { UserEntity } from "../User/UserEntity";

@Entity("teams")
export class TeamEntity {
    @PrimaryGeneratedColumn()
    team_id!: number;

    @Column()
    name!: string;

    @Column({ nullable: true })
    description!: string;

    // Relation vers le manager (un user)
    @ManyToOne(() => UserEntity, { nullable: true })
    @JoinColumn({ name: "manager_id" })
    manager!: UserEntity | null;

    // Relation inverse users → team
    @OneToMany(() => UserEntity, user => user.team)
    members!: UserEntity[];
}