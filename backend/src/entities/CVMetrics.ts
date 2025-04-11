// Create a new file: src/entities/CVMetrics.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { UserResponse } from "./UserResponse";

@Entity("cv_metrics")
export class CVMetrics {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("float")
  confidence!: number;

  @Column("float")
  eyeContact!: number;

  @Column("float")
  distraction!: number;

  @Column("float")
  nervousness!: number;

  @Column("float")
  attentiveness!: number;

  @Column("float")
  posture!: number;

  @Column("float")
  engagement!: number;

  @Column("float")
  emotionalStability!: number;

  @Column("float")
  expressionVariability!: number;

  @Column("float")
  facialAuthenticity!: number;

  @Column("float")
  headMovementRate!: number;

  @Column("float")
  duration!: number;

  @Column("varchar", { nullable: true })
  userId!: string;

  @ManyToOne(() => UserResponse, (userResponse) => userResponse.cvMetrics)
  @JoinColumn({ name: "response_id" })
  userResponse!: UserResponse;

  @Column("uuid")
  responseId!: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;
}
