// src/services/category.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Category } from '../entities';
import { CreateCategoryRequest, UpdateCategoryRequest, CategoryResponse } from '../types';

export const getCategoryRepository = (): Repository<Category> => {
  return AppDataSource.getRepository(Category);
};

export const getAllCategories = async (): Promise<CategoryResponse[]> => {
  const categoryRepository = getCategoryRepository();
  const categories = await categoryRepository.find({
    order: { order: 'ASC', name: 'ASC' }
  });
  
  return categories.map(category => ({
    id: category.id,
    name: category.name,
    description: category.description,
    order: category.order
  }));
};

export const getCategoryById = async (id: string): Promise<CategoryResponse> => {
  const categoryRepository = getCategoryRepository();
  const category = await categoryRepository.findOne({ where: { id } });
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    order: category.order
  };
};

export const createCategory = async (categoryData: CreateCategoryRequest): Promise<CategoryResponse> => {
  const categoryRepository = getCategoryRepository();
  
  const newCategory = categoryRepository.create({
    name: categoryData.name,
    description: categoryData.description,
    order: categoryData.order || 0
  });
  
  const savedCategory = await categoryRepository.save(newCategory);
  
  return {
    id: savedCategory.id,
    name: savedCategory.name,
    description: savedCategory.description,
    order: savedCategory.order
  };
};

export const updateCategory = async (id: string, categoryData: UpdateCategoryRequest): Promise<CategoryResponse> => {
  const categoryRepository = getCategoryRepository();
  const category = await categoryRepository.findOne({ where: { id } });
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  if (categoryData.name !== undefined) {
    category.name = categoryData.name;
  }
  
  if (categoryData.description !== undefined) {
    category.description = categoryData.description;
  }
  
  if (categoryData.order !== undefined) {
    category.order = categoryData.order;
  }
  
  const updatedCategory = await categoryRepository.save(category);
  
  return {
    id: updatedCategory.id,
    name: updatedCategory.name,
    description: updatedCategory.description,
    order: updatedCategory.order
  };
};

export const deleteCategory = async (id: string): Promise<void> => {
  const categoryRepository = getCategoryRepository();
  const category = await categoryRepository.findOne({ where: { id } });
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  await categoryRepository.remove(category);
};