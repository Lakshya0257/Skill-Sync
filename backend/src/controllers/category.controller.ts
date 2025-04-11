// src/controllers/category.controller.ts
import { Request, Response } from "express";
import {
  getAllCategories as getAllCategoriesService,
  getCategoryById as getCategoryByIdService,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
} from "../services/category.service";
import { CreateCategoryRequest, UpdateCategoryRequest } from "../types";

/**
 * Get all categories
 */
export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await getAllCategoriesService();
    return void res.status(200).json(categories);
  } catch (error) {
    console.error("Error getting categories:", error);
    return void res
      .status(500)
      .json({ message: "Error retrieving categories" });
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await getCategoryByIdService(id);
    return void res.status(200).json(category);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error getting category:", error);
    return void res.status(500).json({ message: "Error retrieving category" });
  }
};

/**
 * Create a new category
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const categoryData: CreateCategoryRequest = req.body;

    // Validate request
    if (!categoryData.name) {
      return void res
        .status(400)
        .json({ message: "Category name is required" });
    }

    const newCategory = await createCategoryService(categoryData);
    return void res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    return void res.status(500).json({ message: "Error creating category" });
  }
};

/**
 * Update a category
 */
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const categoryData: UpdateCategoryRequest = req.body;

    // Check if there's anything to update
    if (Object.keys(categoryData).length === 0) {
      return void res.status(400).json({ message: "No update data provided" });
    }

    const updatedCategory = await updateCategoryService(id, categoryData);
    return void res.status(200).json(updatedCategory);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error updating category:", error);
    return void res.status(500).json({ message: "Error updating category" });
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await deleteCategoryService(id);
    return void res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error deleting category:", error);
    return void res.status(500).json({ message: "Error deleting category" });
  }
};
