// src/routes/topic.routes.ts
import { Router } from 'express';
import { 
  getAllTopics, 
  getTopicById, 
  createTopic, 
  updateTopic, 
  deleteTopic 
} from '../controllers/topic.controller';

const router = Router();

/**
 * @route GET /api/topics
 * @desc Get all topics
 * @access Public
 */
router.get('/', getAllTopics);

/**
 * @route GET /api/topics/:id
 * @desc Get topic by ID
 * @access Public
 */
router.get('/:id', getTopicById);

/**
 * @route POST /api/topics
 * @desc Create a new topic
 * @access Private
 */
router.post('/', createTopic);

/**
 * @route PUT /api/topics/:id
 * @desc Update a topic
 * @access Private
 */
router.put('/:id', updateTopic);

/**
 * @route DELETE /api/topics/:id
 * @desc Delete a topic
 * @access Private
 */
router.delete('/:id', deleteTopic);

export default router;