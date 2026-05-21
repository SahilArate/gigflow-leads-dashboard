import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { errorMiddleware } from "./middleware";
import authRoutes from "./modules/auth/auth.routes";
import leadsRoutes from "./modules/leads/leads.routes";
import aiRoutes from "./modules/ai/ai.routes";

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://gigflow-leads-dashboard-tawny.vercel.app",
    env.clientUrl,
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "GigFlow API is running",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/ai", aiRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorMiddleware);

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`🚀 GigFlow API running on port ${env.port}`);
    console.log(`📦 Environment: ${env.nodeEnv}`);
    console.log(`🔗 Health: http://localhost:${env.port}/health`);
  });
};

startServer();