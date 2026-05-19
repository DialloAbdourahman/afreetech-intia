import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

const errorLogDir = path.join(process.cwd(), "logs/error");
const debugLogDir = path.join(process.cwd(), "logs/debug");

// ensure logs directories exist
for (const dir of [errorLogDir, debugLogDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * ERROR → file
 */
const errorTransport = new winston.transports.DailyRotateFile({
  level: "error",
  dirname: errorLogDir,
  filename: "%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
  ),
});

/**
 * DEBUG ONLY → file
 */
const debugTransport = new winston.transports.DailyRotateFile({
  level: "debug",
  dirname: debugLogDir,
  filename: "%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "7d",
  format: winston.format.combine(
    winston.format((info) => (info.level === "debug" ? info : false))(),
    winston.format.timestamp(),
    winston.format.colorize(),
  ),
});

/**
 * CONSOLE → everything (CloudWatch)
 */
const consoleTransport = new winston.transports.Console({
  level: "debug",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `[${timestamp}] ${level}: ${message}${
        Object.keys(meta).length ? " " + JSON.stringify(meta) : ""
      }`;
    }),
  ),
});

export const logger = winston.createLogger({
  level: "debug",
  transports: [consoleTransport, errorTransport, debugTransport],
});
