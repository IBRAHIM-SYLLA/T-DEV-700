import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { UserEntity } from "../User/UserEntity";

@Entity("password_reset_tokens")
export class PasswordResetEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: UserEntity;

    @Column({ type: "varchar", length: 255, unique: true })
    token!: string;

    @Column({ type: "timestamp" })
    expires_at!: Date;

    @Column({ type: "boolean", default: false })
    used!: boolean;

    @CreateDateColumn()
    created_at!: Date;
}
