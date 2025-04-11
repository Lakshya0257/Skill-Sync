import { Request, Response } from 'express';
import { getConnectedClientsCount } from '../services/webSocketService';
import { initializeFaceDetection } from '../services/faceDetectionService';

// Get server status
export const getStatus = async (req: Request, res: Response): Promise<void> => {
	try {
		// Check if face detection models are loaded
		let modelsLoaded = true;
		try {
			await initializeFaceDetection();
		} catch (error) {
			modelsLoaded = false;
		}

		res.status(200).json({
			success: true,
			status: 'online',
			connectedClients: getConnectedClientsCount(),
			modelsLoaded,
			version: process.env.npm_package_version || '1.0.0',
			timestamp: Date.now()
		});
	} catch (error) {
		console.error('Error getting server status:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get server status'
		});
	}
};
