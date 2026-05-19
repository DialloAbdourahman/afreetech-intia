import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import authRouter from "./routes/auth.routes";
import clientRouter from "./routes/client.route";

const app = express();

// CORS configuration based on allowed ports from environment
const allowedPortsEnv = process.env.ALLOWED_PORTS; // e.g. "3000,3001,3002"
const allowedOrigins: string[] = allowedPortsEnv
  ? allowedPortsEnv
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .map((port) => `http://localhost:${port}`)
  : [];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser tools (Postman, curl) that don't send an origin
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.length === 0) {
      // If no ALLOWED_PORTS configured, allow all origins (safe default for dev)
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "API is running with Express + TypeScript" });
});

app.use("/api/auth", authRouter);
app.use("/api/clients", clientRouter);

export default app;
