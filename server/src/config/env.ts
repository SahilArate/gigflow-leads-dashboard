import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

console.log("📁 Loading .env from:", path.resolve(process.cwd(), ".env"));
console.log("🔗 URI preview:", process.env.MONGODB_URI?.substring(0, 50));

const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "GROQ_API_KEY",
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const env = {
  port: process.env.PORT || "5000",
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI as string,
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY as string,
  },
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
} as const;

export type Env = typeof env;