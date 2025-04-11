// src/routes/index.ts
import { Router } from "express";
import authRoutes from "./auth.routes";
import categoryRoutes from "./category.routes";
import topicRoutes from "./topic.routes";
import questionRoutes from "./question.routes";
import userResponseRoutes from "./userResponse.routes";
import userProgressRoutes from "./userProgress.routes";
import aiRoutes from "./ai.routes";
import userIntroductionRoutes from "./userIntroduction.routes";
import cvMetricsRoutes from "./cvMetrics.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/topics", topicRoutes);
router.use("/questions", questionRoutes);
router.use("/responses", userResponseRoutes);
router.use("/progress", userProgressRoutes);
router.use("/ai", aiRoutes);
router.use("/users", userIntroductionRoutes);
router.use("/cv-response", cvMetricsRoutes);

export default router;
