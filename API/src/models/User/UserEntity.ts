import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TeamEntity } from "../Team/TeamEntity";
import { ClockEntity } from "../Clock/ClockEntity";
import { RoleEnum } from "../../enums/role-enum";

@Entity("users")
export class UserEntity {
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
        enum: [RoleEnum.SUPER_ADMIN, RoleEnum.RH, RoleEnum.MANAGER, RoleEnum.EMPLOYEE]
    })
    role!: RoleEnum.SUPER_ADMIN | RoleEnum.RH | RoleEnum.MANAGER | RoleEnum.EMPLOYEE;

    @ManyToOne(() => TeamEntity, team => team.members, {
        nullable: true,
        onDelete: "SET NULL"
    })
    @JoinColumn({ name: "team_id" })
    team!: TeamEntity | null;

    @OneToMany(() => TeamEntity, team => team.manager)
    managed_teams!: TeamEntity[];

    @OneToMany(() => ClockEntity, clock => clock.user)
    clocks!: ClockEntity[];

}