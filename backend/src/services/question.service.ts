// src/services/question.service.ts
import { Repository, In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Question, Category, Topic, EvaluationFactor } from '../entities';
import { 
  CreateQuestionRequest, 
  UpdateQuestionRequest, 
  QuestionResponse
} from '../types';

export const getQuestionRepository = (): Repository<Question> => {
  return AppDataSource.getRepository(Question);
};

export const getAllQuestions = async (): Promise<QuestionResponse[]> => {
  const questionRepository = getQuestionRepository();
  const questions = await questionRepository.find({
    relations: ['category', 'topics', 'evaluationFactors'],
    order: { createdAt: 'DESC' }
  });
  
  return questions.map(question => mapQuestionToResponse(question));
};

export const getQuestionsByCategory = async (categoryId: string): Promise<QuestionResponse[]> => {
  const questionRepository = getQuestionRepository();
  const questions = await questionRepository.find({
    where: { category: { id: categoryId } },
    relations: ['category', 'topics', 'evaluationFactors'],
    order: { createdAt: 'DESC' }
  });
  
  return questions.map(question => mapQuestionToResponse(question));
};

export const getQuestionsByTopic = async (topicId: string): Promise<QuestionResponse[]> => {
  const questionRepository = getQuestionRepository();
  const questions = await questionRepository.find({
    relations: ['category', 'topics', 'evaluationFactors'],
    where: {
      topics: {
        id: topicId
      }
    },
    order: { createdAt: 'DESC' }
  });
  
  return questions.map(question => mapQuestionToResponse(question));
};

export const getQuestionById = async (id: string): Promise<QuestionResponse> => {
  const questionRepository = getQuestionRepository();
  const question = await questionRepository.findOne({
    where: { id },
    relations: ['category', 'topics', 'evaluationFactors']
  });
  
  if (!question) {
    throw new Error('Question not found');
  }
  
  return mapQuestionToResponse(question);
};

export const createQuestion = async (questionData: CreateQuestionRequest): Promise<QuestionResponse> => {
  const questionRepository = getQuestionRepository();
  const evaluationFactorRepository = AppDataSource.getRepository(EvaluationFactor);
  
  // Validate category
  const category = await AppDataSource.getRepository(Category).findOne({ 
    where: { id: questionData.categoryId } 
  });
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  // Validate topics
  const topics = await AppDataSource.getRepository(Topic).find({ 
    where: { id: In(questionData.topicIds) } 
  });
  
  if (topics.length !== questionData.topicIds.length) {
    throw new Error('One or more topics not found');
  }
  
  // Create question
  const newQuestion = questionRepository.create({
    text: questionData.text,
    correctAnswer: questionData.correctAnswer,
    difficulty: questionData.difficulty || 1,
    category,
    topics
  });
  
  const savedQuestion = await questionRepository.save(newQuestion);
  
  // Create evaluation factors
  const evaluationFactors = questionData.evaluationFactors.map(factor => {
    return evaluationFactorRepository.create({
      name: factor.name,
      description: factor.description,
      weight: factor.weight || 1,
      question: savedQuestion
    });
  });
  
  await evaluationFactorRepository.save(evaluationFactors);
  
  // Return complete question with relations
  const completeQuestion = await questionRepository.findOne({
    where: { id: savedQuestion.id },
    relations: ['category', 'topics', 'evaluationFactors']
  });
  
  if (!completeQuestion) {
    throw new Error('Failed to retrieve complete question');
  }
  
  return mapQuestionToResponse(completeQuestion);
};

export const updateQuestion = async (id: string, questionData: UpdateQuestionRequest): Promise<QuestionResponse> => {
  const questionRepository = getQuestionRepository();
  const question = await questionRepository.findOne({
    where: { id },
    relations: ['category', 'topics', 'evaluationFactors']
  });
  
  if (!question) {
    throw new Error('Question not found');
  }
  
  // Update basic fields
  if (questionData.text !== undefined) {
    question.text = questionData.text;
  }
  
  if (questionData.correctAnswer !== undefined) {
    question.correctAnswer = questionData.correctAnswer;
  }
  
  if (questionData.difficulty !== undefined) {
    question.difficulty = questionData.difficulty;
  }
  
  // Update category if provided
  if (questionData.categoryId) {
    const category = await AppDataSource.getRepository(Category).findOne({ 
      where: { id: questionData.categoryId } 
    });
    
    if (!category) {
      throw new Error('Category not found');
    }
    
    question.category = category;
  }
  
  // Update topics if provided
  if (questionData.topicIds) {
    const topics = await AppDataSource.getRepository(Topic).find({ 
      where: { id: In(questionData.topicIds) } 
    });
    
    if (topics.length !== questionData.topicIds.length) {
      throw new Error('One or more topics not found');
    }
    
    question.topics = topics;
  }
  
  const updatedQuestion = await questionRepository.save(question);
  
  // Get complete question with all relations
  const completeQuestion = await questionRepository.findOne({
    where: { id: updatedQuestion.id },
    relations: ['category', 'topics', 'evaluationFactors']
  });
  
  if (!completeQuestion) {
    throw new Error('Failed to retrieve updated question');
  }
  
  return mapQuestionToResponse(completeQuestion);
};

export const deleteQuestion = async (id: string): Promise<void> => {
  const questionRepository = getQuestionRepository();
  const question = await questionRepository.findOne({ where: { id } });
  
  if (!question) {
    throw new Error('Question not found');
  }
  
  await questionRepository.remove(question);
};

// Helper function to map Question entity to QuestionResponse
const mapQuestionToResponse = (question: Question): QuestionResponse => {
  return {
    id: question.id,
    text: question.text,
    correctAnswer: question.correctAnswer,
    difficulty: question.difficulty,
    category: {
      id: question.category.id,
      name: question.category.name,
      description: question.category.description,
      order: question.category.order
    },
    topics: question.topics.map(topic => ({
      id: topic.id,
      name: topic.name,
      description: topic.description
    })),
    evaluationFactors: question.evaluationFactors ? question.evaluationFactors.map(factor => ({
      id: factor.id,
      name: factor.name,
      description: factor.description,
      weight: factor.weight
    })) : []
  };
};