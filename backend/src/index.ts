// src/index.ts
import 'reflect-metadata';
import dotenv from 'dotenv';
import app from './app';
import { initializeDatabase } from './config/database';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Start the server
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    // Start listening on port
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();