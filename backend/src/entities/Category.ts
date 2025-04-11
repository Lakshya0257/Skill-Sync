import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Question } from "./Question";
import { UserProgress } from "./UserProgress";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar")
  name!: string;

  @Column("text", { nullable: true })
  description?: string;

  @Column("int", { default: 0 })
  order!: number;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  @OneToMany(() => Question, (question) => question.category)
  questions?: Question[];

  @OneToMany(() => UserProgress, (userProgress) => userProgress.category)
  userProgress?: UserProgress[];
}
