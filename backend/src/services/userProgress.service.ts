// src/services/userProgress.service.ts
import { Repository, In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { UserProgress, User, Category, Topic } from '../entities';
import { UserProgressResponse, CategoryResponse, TopicResponse } from '../types';

export const getUserProgressRepository = (): Repository<UserProgress> => {
  return AppDataSource.getRepository(UserProgress);
};

export const getUserProgressByUser = async (userId: string): Promise<UserProgressResponse[]> => {
  const progressRepository = getUserProgressRepository();
  const progressEntries = await progressRepository.find({
    where: { user: { id: userId } },
    relations: ['category', 'topics'],
    order: { score: 'DESC' }
  });
  
  return progressEntries.map(progress => mapUserProgressToResponse(progress));
};

export const getUserProgressByCategory = async (userId: string, categoryId: string): Promise<UserProgressResponse> => {
  const progressRepository = getUserProgressRepository();
  const progress = await progressRepository.findOne({
    where: { 
      user: { id: userId },
      category: { id: categoryId }
    },
    relations: ['category', 'topics']
  });
  
  if (!progress) {
    throw new Error('User progress for this category not found');
  }
  
  return mapUserProgressToResponse(progress);
};

export const getUserProgressByTopic = async (userId: string, topicId: string): Promise<UserProgressResponse[]> => {
  const progressRepository = getUserProgressRepository();
  const progressEntries = await progressRepository.find({
    relations: ['user', 'category', 'topics'],
    where: {
      user: { id: userId },
      topics: {
        id: topicId
      }
    },
    order: { score: 'DESC' }
  });
  
  return progressEntries.map(progress => mapUserProgressToResponse(progress));
};

export const getUserProgressSummary = async (userId: string): Promise<{
  overallScore: number;
  questionsAttempted: number;
  questionsCorrect: number;
  topCategories: { category: CategoryResponse; score: number }[];
  topTopics: { topic: TopicResponse; score: number }[];
}> => {
  const progressRepository = getUserProgressRepository();
  const progressEntries = await progressRepository.find({
    where: { user: { id: userId } },
    relations: ['category', 'topics'],
    order: { score: 'DESC' }
  });
  
  if (progressEntries.length === 0) {
    return {
      overallScore: 0,
      questionsAttempted: 0,
      questionsCorrect: 0,
      topCategories: [],
      topTopics: []
    };
  }
  
  // Calculate overall statistics
  const totalQuestions = progressEntries.reduce((sum, entry) => sum + entry.questionsAttempted, 0);
  const correctQuestions = progressEntries.reduce((sum, entry) => sum + entry.questionsCorrect, 0);
  const weightedScoreSum = progressEntries.reduce((sum, entry) => sum + (entry.score * entry.questionsAttempted), 0);
  const overallScore = totalQuestions > 0 ? weightedScoreSum / totalQuestions : 0;
  
  // Get top categories
  const topCategories = progressEntries
    .filter(entry => entry.questionsAttempted >= 3) // Only consider categories with enough questions
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(entry => ({
      category: {
        id: entry.category.id,
        name: entry.category.name,
        description: entry.category.description,
        order: entry.category.order
      },
      score: entry.score
    }));
  
  // Get top topics
  // First, collect all topics with their scores
  const topicScores: Map<string, { topic: TopicResponse; totalScore: number; count: number }> = new Map();
  
  progressEntries.forEach(entry => {
    entry.topics.forEach(topic => {
      const existingTopic = topicScores.get(topic.id);
      
      if (existingTopic) {
        existingTopic.totalScore += entry.score;
        existingTopic.count += 1;
      } else {
        topicScores.set(topic.id, {
          topic: {
            id: topic.id,
            name: topic.name,
            description: topic.description
          },
          totalScore: entry.score,
          count: 1
        });
      }
    });
  });
  
  // Convert to array and calculate average scores
  const topTopics = Array.from(topicScores.values())
    .filter(item => item.count >= 2) // Only consider topics with enough questions
    .map(item => ({
      topic: item.topic,
      score: item.totalScore / item.count
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  
  return {
    overallScore,
    questionsAttempted: totalQuestions,
    questionsCorrect: correctQuestions,
    topCategories,
    topTopics
  };
};

export const updateUserProgress = async (
  userId: string,
  categoryId: string,
  topicIds: string[],
  score: number
): Promise<void> => {
  const progressRepository = getUserProgressRepository();
  const userRepository = AppDataSource.getRepository(User);
  const categoryRepository = AppDataSource.getRepository(Category);
  const topicRepository = AppDataSource.getRepository(Topic);
  
  // Find user
  const user = await userRepository.findOne({ where: { id: userId } });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Find category
  const category = await categoryRepository.findOne({ where: { id: categoryId } });
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  // Find topics
  const topics = await topicRepository.find({ where: { id: In(topicIds) } });
  
  // Find or create progress entry for this category
  let progress = await progressRepository.findOne({
    where: {
      user: { id: userId },
      category: { id: categoryId }
    },
    relations: ['topics']
  });
  
  if (!progress) {
    // Create new progress entry
    progress = progressRepository.create({
      user,
      category,
      topics,
      score: 0,
      questionsAttempted: 0,
      questionsCorrect: 0
    });
  } else {
    // Update topics
    const existingTopicIds = progress.topics.map(t => t.id);
    const newTopics = topics.filter(t => !existingTopicIds.includes(t.id));
    
    if (newTopics.length > 0) {
      progress.topics = [...progress.topics, ...newTopics];
    }
  }
  
  // Update stats
  progress.questionsAttempted += 1;
  
  if (score >= 70) {
    progress.questionsCorrect += 1;
  }
  
  // Update score as a weighted average
  const totalQuestions = progress.questionsAttempted;
  const oldScoreWeight = (totalQuestions - 1) / totalQuestions;
  const newScoreWeight = 1 / totalQuestions;
  
  progress.score = (progress.score * oldScoreWeight) + (score * newScoreWeight);
  
  // Save progress
  await progressRepository.save(progress);
  
  // Update topic-specific progress for each topic
  for (const topic of topics) {
    await updateTopicProgress(userId, categoryId, topic.id, score);
  }
};

const updateTopicProgress = async (
  userId: string,
  categoryId: string,
  topicId: string,
  score: number
): Promise<void> => {
  // This is a simplified implementation. In a real app, you might want to
  // track topic-specific progress separately.
};

// Helper function to map UserProgress entity to UserProgressResponse
const mapUserProgressToResponse = (progress: UserProgress): UserProgressResponse => {
  return {
    id: progress.id,
    score: progress.score,
    questionsAttempted: progress.questionsAttempted,
    questionsCorrect: progress.questionsCorrect,
    category: {
      id: progress.category.id,
      name: progress.category.name,
      description: progress.category.description,
      order: progress.category.order
    },
    topics: progress.topics.map(topic => ({
      id: topic.id,
      name: topic.name,
      description: topic.description
    }))
  };
};