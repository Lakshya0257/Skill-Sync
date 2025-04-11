// src/routes/question.routes.ts
import { Router } from 'express';
import { 
  getAllQuestions, 
  getQuestionById, 
  getQuestionsByCategory,
  getQuestionsByTopic,
  createQuestion, 
  updateQuestion, 
  deleteQuestion,
  createEvaluationFactor,
  updateEvaluationFactor,
  deleteEvaluationFactor
} from '../controllers/question.controller';

const router = Router();

/**
 * @route GET /api/questions
 * @desc Get all questions
 * @access Public
 */
router.get('/', getAllQuestions);

/**
 * @route GET /api/questions/category/:categoryId
 * @desc Get questions by category
 * @access Public
 */
router.get('/category/:categoryId', getQuestionsByCategory);

/**
 * @route GET /api/questions/topic/:topicId
 * @desc Get questions by topic
 * @access Public
 */
router.get('/topic/:topicId', getQuestionsByTopic);

/**
 * @route GET /api/questions/:id
 * @desc Get question by ID
 * @access Public
 */
router.get('/:id', getQuestionById);

/**
 * @route POST /api/questions
 * @desc Create a new question
 * @access Private
 */
router.post('/', createQuestion);

/**
 * @route PUT /api/questions/:id
 * @desc Update a question
 * @access Private
 */
router.put('/:id', updateQuestion);

/**
 * @route DELETE /api/questions/:id
 * @desc Delete a question
 * @access Private
 */
router.delete('/:id', deleteQuestion);

/**
 * @route POST /api/questions/:questionId/factors
 * @desc Add evaluation factor to a question
 * @access Private
 */
router.post('/:questionId/factors', createEvaluationFactor);

/**
 * @route PUT /api/questions/factors/:factorId
 * @desc Update an evaluation factor
 * @access Private
 */
router.put('/factors/:factorId', updateEvaluationFactor);

/**
 * @route DELETE /api/questions/factors/:factorId
 * @desc Delete an evaluation factor
 * @access Private
 */
router.delete('/factors/:factorId', deleteEvaluationFactor);

export default router;