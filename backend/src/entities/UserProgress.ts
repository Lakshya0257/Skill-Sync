import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { User } from "./User";
import { Category } from "./Category";
import { Topic } from "./Topic";

@Entity("user_progress")
export class UserProgress {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("float", { default: 0 })
  score!: number;

  @Column("int", { default: 0 })
  questionsAttempted!: number;

  @Column("int", { default: 0 })
  questionsCorrect!: number;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.progress)
  user!: User;

  @ManyToOne(() => Category, (category) => category.userProgress)
  category!: Category;

  @ManyToMany(() => Topic, (topic) => topic.userProgress)
  @JoinTable({
    name: "user_topic_progress",
    joinColumn: { name: "progress_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "topic_id", referencedColumnName: "id" },
  })
  topics!: Topic[];
}
