// src/services/evaluationFactor.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { EvaluationFactor, Question } from '../entities';
import { 
  CreateEvaluationFactorRequest, 
  UpdateEvaluationFactorRequest, 
  EvaluationFactorResponse 
} from '../types';

export const getEvaluationFactorRepository = (): Repository<EvaluationFactor> => {
  return AppDataSource.getRepository(EvaluationFactor);
};

export const getEvaluationFactorsByQuestionId = async (questionId: string): Promise<EvaluationFactorResponse[]> => {
  const factorRepository = getEvaluationFactorRepository();
  const factors = await factorRepository.find({
    where: { question: { id: questionId } },
    order: { name: 'ASC' }
  });
  
  return factors.map(factor => ({
    id: factor.id,
    name: factor.name,
    description: factor.description,
    weight: factor.weight
  }));
};

export const getEvaluationFactorById = async (id: string): Promise<EvaluationFactorResponse> => {
  const factorRepository = getEvaluationFactorRepository();
  const factor = await factorRepository.findOne({ 
    where: { id },
    relations: ['question']
  });
  
  if (!factor) {
    throw new Error('Evaluation factor not found');
  }
  
  return {
    id: factor.id,
    name: factor.name,
    description: factor.description,
    weight: factor.weight
  };
};

export const createEvaluationFactor = async (
  questionId: string, 
  factorData: CreateEvaluationFactorRequest
): Promise<EvaluationFactorResponse> => {
  const factorRepository = getEvaluationFactorRepository();
  const questionRepository = AppDataSource.getRepository(Question);
  
  // Find question
  const question = await questionRepository.findOne({ where: { id: questionId } });
  
  if (!question) {
    throw new Error('Question not found');
  }
  
  // Create factor
  const newFactor = factorRepository.create({
    name: factorData.name,
    description: factorData.description,
    weight: factorData.weight || 1,
    question
  });
  
  const savedFactor = await factorRepository.save(newFactor);
  
  return {
    id: savedFactor.id,
    name: savedFactor.name,
    description: savedFactor.description,
    weight: savedFactor.weight
  };
};

export const updateEvaluationFactor = async (
  id: string, 
  factorData: UpdateEvaluationFactorRequest
): Promise<EvaluationFactorResponse> => {
  const factorRepository = getEvaluationFactorRepository();
  const factor = await factorRepository.findOne({ where: { id } });
  
  if (!factor) {
    throw new Error('Evaluation factor not found');
  }
  
  if (factorData.name !== undefined) {
    factor.name = factorData.name;
  }
  
  if (factorData.description !== undefined) {
    factor.description = factorData.description;
  }
  
  if (factorData.weight !== undefined) {
    factor.weight = factorData.weight;
  }
  
  const updatedFactor = await factorRepository.save(factor);
  
  return {
    id: updatedFactor.id,
    name: updatedFactor.name,
    description: updatedFactor.description,
    weight: updatedFactor.weight
  };
};

export const deleteEvaluationFactor = async (id: string): Promise<void> => {
  const factorRepository = getEvaluationFactorRepository();
  const factor = await factorRepository.findOne({ where: { id } });
  
  if (!factor) {
    throw new Error('Evaluation factor not found');
  }
  
  await factorRepository.remove(factor);
};