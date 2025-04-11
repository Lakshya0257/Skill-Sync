import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Question } from './Question';
import { UserProgress } from './UserProgress';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar')
  name!: string;

  @Column('text', { nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @ManyToMany(() => Question, (question) => question.topics)
  questions?: Question[];

  @ManyToMany(() => UserProgress, (userProgress) => userProgress.topics)
  userProgress?: UserProgress[];
}