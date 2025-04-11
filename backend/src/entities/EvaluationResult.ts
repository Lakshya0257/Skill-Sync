import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { UserResponse } from "./UserResponse";

@Entity("evaluation_results")
export class EvaluationResult {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("varchar")
  factorName!: string;

  @Column("float")
  score!: number;

  @Column("text", { nullable: true })
  feedback?: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(
    () => UserResponse,
    (userResponse) => userResponse.evaluationResults
  )
  userResponse!: UserResponse;
}
