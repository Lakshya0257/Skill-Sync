// src/routes/category.routes.ts
import { Router } from 'express';
import { 
  getAllCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/category.controller';

const router = Router();

/**
 * @route GET /api/categories
 * @desc Get all categories
 * @access Public
 */
router.get('/', getAllCategories);

/**
 * @route GET /api/categories/:id
 * @desc Get category by ID
 * @access Public
 */
router.get('/:id', getCategoryById);

/**
 * @route POST /api/categories
 * @desc Create a new category
 * @access Private
 */
router.post('/', createCategory);

/**
 * @route PUT /api/categories/:id
 * @desc Update a category
 * @access Private
 */
router.put('/:id', updateCategory);

/**
 * @route DELETE /api/categories/:id
 * @desc Delete a category
 * @access Private
 */
router.delete('/:id', deleteCategory);

export default router;