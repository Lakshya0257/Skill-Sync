import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Category } from './Category';
import { Topic } from './Topic';
import { EvaluationFactor } from './EvaluationFactor';
import { UserResponse } from './UserResponse';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  text!: string;

  @Column('text')
  correctAnswer!: string;

  @Column('int', { default: 1 })
  difficulty!: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne(() => Category, (category) => category.questions)
  category!: Category;

  @ManyToMany(() => Topic, (topic) => topic.questions)
  @JoinTable({
    name: 'question_topics',
    joinColumn: { name: 'question_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'topic_id', referencedColumnName: 'id' }
  })
  topics!: Topic[];

  @OneToMany(() => EvaluationFactor, (factor) => factor.question)
  evaluationFactors?: EvaluationFactor[];

  @OneToMany(() => UserResponse, (userResponse) => userResponse.question)
  userResponses?: UserResponse[];
}