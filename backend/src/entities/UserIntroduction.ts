// src/entities/UserIntroduction.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("user_introductions")
export class UserIntroduction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text")
  introduction!: string;

  @Column("varchar")
  targetedJobProfile!: string;

  @Column("simple-array")
  suggestedCategories!: string[];

  @Column("simple-array")
  suggestedTopics!: string[];

  @Column("simple-array")
  strengthAreas!: string[];

  @Column("simple-array")
  improvementAreas!: string[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.introductions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column("uuid")
  userId!: string;
}
