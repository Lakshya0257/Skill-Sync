// src/controllers/topic.controller.ts
import { Request, Response } from "express";
import {
  getAllTopics as getAllTopicsService,
  getTopicById as getTopicByIdService,
  createTopic as createTopicService,
  updateTopic as updateTopicService,
  deleteTopic as deleteTopicService,
} from "../services/topic.service";
import { CreateTopicRequest, UpdateTopicRequest } from "../types";

/**
 * Get all topics
 */
export const getAllTopics = async (_req: Request, res: Response) => {
  try {
    const topics = await getAllTopicsService();
    return void res.status(200).json(topics);
  } catch (error) {
    console.error("Error getting topics:", error);
    return void res.status(500).json({ message: "Error retrieving topics" });
  }
};

/**
 * Get topic by ID
 */
export const getTopicById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const topic = await getTopicByIdService(id);
    return void res.status(200).json(topic);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error getting topic:", error);
    return void res.status(500).json({ message: "Error retrieving topic" });
  }
};

/**
 * Create a new topic
 */
export const createTopic = async (req: Request, res: Response) => {
  try {
    const topicData: CreateTopicRequest = req.body;

    // Validate request
    if (!topicData.name) {
      return void res.status(400).json({ message: "Topic name is required" });
    }

    const newTopic = await createTopicService(topicData);
    return void res.status(201).json(newTopic);
  } catch (error) {
    console.error("Error creating topic:", error);
    return void res.status(500).json({ message: "Error creating topic" });
  }
};

/**
 * Update a topic
 */
export const updateTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const topicData: UpdateTopicRequest = req.body;

    // Check if there's anything to update
    if (Object.keys(topicData).length === 0) {
      return void res.status(400).json({ message: "No update data provided" });
    }

    const updatedTopic = await updateTopicService(id, topicData);
    return void res.status(200).json(updatedTopic);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error updating topic:", error);
    return void res.status(500).json({ message: "Error updating topic" });
  }
};

/**
 * Delete a topic
 */
export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await deleteTopicService(id);
    return void res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return void res.status(404).json({ message: error.message });
    }

    console.error("Error deleting topic:", error);
    return void res.status(500).json({ message: "Error deleting topic" });
  }
};
