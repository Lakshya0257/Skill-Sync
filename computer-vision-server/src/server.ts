// src/server.ts
import 'reflect-metadata';
import dotenv from 'dotenv';
import http from 'http';
import app from './app';
import config from './config/env';
import { initializeWebSocketServer, closeWebSocketServer } from './services/webSocketService';
import { initializeFaceDetection } from './services/faceDetectionService';
import { cleanupSessions } from './services/sessionService';

// Load environment variables
dotenv.config();

const PORT = config.port;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
initializeWebSocketServer(server);

// Initialize face detection models
initializeFaceDetection()
	.then(() => console.log('Face detection models loaded successfully'))
	.catch(error => console.error('Failed to load face detection models:', error));

// Schedule session cleanup (every hour)
setInterval(() => {
	try {
		cleanupSessions();
	} catch (error) {
		console.error('Error during session cleanup:', error);
	}
}, 60 * 60 * 1000);

// Start the server
server.listen(PORT, () => {
	console.log(`CV server running on port ${PORT}`);
	console.log(`WebSocket server available at ws://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown() {
	console.log('Received shutdown signal, closing server...');

	try {
		// Close WebSocket server
		await closeWebSocketServer();
		console.log('WebSocket server closed');

		// Close HTTP server
		server.close(() => {
			console.log('HTTP server closed');
			process.exit(0);
		});

		// Force exit after 5 seconds if server doesn't close gracefully
		setTimeout(() => {
			console.error('Forcing server shutdown after timeout');
			process.exit(1);
		}, 5000);
	} catch (error) {
		console.error('Error during shutdown:', error);
		process.exit(1);
	}
}
