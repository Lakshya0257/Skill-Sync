// src/services/topic.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Topic } from '../entities';
import { CreateTopicRequest, UpdateTopicRequest, TopicResponse } from '../types';

export const getTopicRepository = (): Repository<Topic> => {
  return AppDataSource.getRepository(Topic);
};

export const getAllTopics = async (): Promise<TopicResponse[]> => {
  const topicRepository = getTopicRepository();
  const topics = await topicRepository.find({
    order: { name: 'ASC' }
  });
  
  return topics.map(topic => ({
    id: topic.id,
    name: topic.name,
    description: topic.description
  }));
};

export const getTopicById = async (id: string): Promise<TopicResponse> => {
  const topicRepository = getTopicRepository();
  const topic = await topicRepository.findOne({ where: { id } });
  
  if (!topic) {
    throw new Error('Topic not found');
  }
  
  return {
    id: topic.id,
    name: topic.name,
    description: topic.description
  };
};

export const createTopic = async (topicData: CreateTopicRequest): Promise<TopicResponse> => {
  const topicRepository = getTopicRepository();
  
  const newTopic = topicRepository.create({
    name: topicData.name,
    description: topicData.description
  });
  
  const savedTopic = await topicRepository.save(newTopic);
  
  return {
    id: savedTopic.id,
    name: savedTopic.name,
    description: savedTopic.description
  };
};

export const updateTopic = async (id: string, topicData: UpdateTopicRequest): Promise<TopicResponse> => {
  const topicRepository = getTopicRepository();
  const topic = await topicRepository.findOne({ where: { id } });
  
  if (!topic) {
    throw new Error('Topic not found');
  }
  
  if (topicData.name !== undefined) {
    topic.name = topicData.name;
  }
  
  if (topicData.description !== undefined) {
    topic.description = topicData.description;
  }
  
  const updatedTopic = await topicRepository.save(topic);
  
  return {
    id: updatedTopic.id,
    name: updatedTopic.name,
    description: updatedTopic.description
  };
};

export const deleteTopic = async (id: string): Promise<void> => {
  const topicRepository = getTopicRepository();
  const topic = await topicRepository.findOne({ where: { id } });
  
  if (!topic) {
    throw new Error('Topic not found');
  }
  
  await topicRepository.remove(topic);
};