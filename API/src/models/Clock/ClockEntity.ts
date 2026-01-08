import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { UserEntity } from "../User/UserEntity";

@Entity("clocks")
export class ClockEntity {

    @PrimaryGeneratedColumn()
    clock_id!: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    arrival_time!: Date;

    @Column({ type: "timestamp", nullable: true })
    departure_time!: Date | null;

    @ManyToOne(() => UserEntity, user => user.clocks, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: UserEntity;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
