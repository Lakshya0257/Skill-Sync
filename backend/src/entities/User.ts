// src/entities/User.ts - Update
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { UserProgress } from "./UserProgress";
import { UserResponse } from "./UserResponse";
import { UserIntroduction } from "./UserIntroduction";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar", { unique: true })
  email!: string;

  @Column("varchar")
  password!: string; // Will be hashed

  @Column("varchar", { nullable: true })
  name?: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  @OneToMany(() => UserProgress, (userProgress) => userProgress.user)
  progress?: UserProgress[];

  @OneToMany(() => UserResponse, (userResponse) => userResponse.user)
  responses?: UserResponse[];

  @OneToMany(
    () => UserIntroduction,
    (userIntroduction) => userIntroduction.user
  )
  introductions?: UserIntroduction[];
}
