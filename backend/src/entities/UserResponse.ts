import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Question } from "./Question";
import { EvaluationResult } from "./EvaluationResult";
import { CVMetrics } from "./CVMetrics";

@Entity("user_responses")
export class UserResponse {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text")
  answer!: string;

  @Column("float", { nullable: true })
  overallScore?: number;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.responses)
  user!: User;

  @ManyToOne(() => Question, (question) => question.userResponses)
  question!: Question;

  @OneToMany(() => EvaluationResult, (result) => result.userResponse)
  evaluationResults?: EvaluationResult[];

  @OneToMany(() => CVMetrics, (cvMetrics) => cvMetrics.userResponse)
  cvMetrics?: CVMetrics[];
}
