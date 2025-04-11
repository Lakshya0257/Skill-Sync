// src/config/database.ts
import { DataSource } from "typeorm";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.PG_URL,
  database: process.env.DB_NAME || "neondb",
  synchronize: process.env.NODE_ENV !== "production", // Only true for development
  logging: process.env.NODE_ENV !== "production",
  entities: [path.join(__dirname, "../entities/**/*.{ts,js}")],
  migrations: [path.join(__dirname, "../migrations/**/*.{ts,js}")],
});

export const initializeDatabase = async (): Promise<DataSource> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Data Source has been initialized!");
    }
    return AppDataSource;
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
    throw error;
  }
};
