import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Question } from './Question';

@Entity('evaluation_factors')
export class EvaluationFactor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar')
  name!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('float', { default: 1 })
  weight!: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne(() => Question, (question) => question.evaluationFactors)
  question!: Question;
}