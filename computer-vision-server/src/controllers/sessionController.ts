import { Request, Response } from 'express';
import {
	startSession,
	getSession,
	getSessionMetrics,
	endSession
} from '../services/sessionService';

// Start a new CV analysis session
export const createSession = (req: Request, res: Response): void => {
	try {
		const { userId, questionId, responseId } = req.body;

		// Validate request
		if (!userId || !questionId || !responseId) {
			res.status(400).json({
				success: false,
				message: 'Missing required fields: userId, questionId, responseId'
			});
			return;
		}

		const sessionId = startSession({ userId, questionId, responseId });

		res.status(201).json({
			success: true,
			sessionId,
			message: 'Session created successfully'
		});
	} catch (error) {
		console.error('Error creating session:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to create session'
		});
	}
};

// Get session details
export const getSessionDetails = (req: Request, res: Response): void => {
	try {
		const { sessionId } = req.params;

		const session = getSession(sessionId);

		if (!session) {
			res.status(404).json({
				success: false,
				message: 'Session not found'
			});
			return;
		}

		res.status(200).json({
			success: true,
			session: {
				sessionId: session.sessionId,
				userId: session.userId,
				questionId: session.questionId,
				responseId: session.responseId,
				startTime: session.startTime,
				isActive: session.isActive,
				framesCount: session.frames.length
			}
		});
	} catch (error) {
		console.error('Error getting session details:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get session details'
		});
	}
};

// Get session metrics
export const getMetrics = (req: Request, res: Response): void => {
	try {
		const { sessionId } = req.params;

		const metrics = getSessionMetrics(sessionId);

		if (!metrics) {
			res.status(404).json({
				success: false,
				message: 'Session not found'
			});
			return;
		}

		res.status(200).json({
			success: true,
			metrics
		});
	} catch (error) {
		console.error('Error getting session metrics:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get session metrics'
		});
	}
};

// End a session
export const terminateSession = (req: Request, res: Response): void => {
	try {
		const { sessionId } = req.params;

		const metrics = endSession(sessionId);

		if (!metrics) {
			res.status(404).json({
				success: false,
				message: 'Session not found'
			});
			return;
		}

		res.status(200).json({
			success: true,
			message: 'Session ended successfully',
			metrics
		});
	} catch (error) {
		console.error('Error ending session:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to end session'
		});
	}
};
