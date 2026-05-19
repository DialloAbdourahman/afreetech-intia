import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { OrchestrationResult } from "../utils/orchestration-result";
import { EnumStatusCode } from "../enums/response.status.code";
import { logger } from "../utils/winston";

export interface AuthenticatedAdminRequest extends Request {
  adminId?: string;
  adminEmail?: string;
}

export function requireAdmin(
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader || typeof authHeader !== "string") {
    const result = OrchestrationResult.Failure({
      statusCode: EnumStatusCode.BAD_REQUEST,
      message: "Authorization header is missing",
    });

    res.status(401).json(result);
    return;
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    const result = OrchestrationResult.Failure({
      statusCode: EnumStatusCode.BAD_REQUEST,
      message: "Authorization header must be in the format: Bearer <token>",
    });

    res.status(401).json(result);
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    logger.error(
      "JWT_SECRET is not defined in environment for requireAdmin middleware",
    );

    const result = OrchestrationResult.Failure({
      statusCode: EnumStatusCode.INTERNAL_SERVER_ERROR,
      message: "Authentication is not configured",
    });

    res.status(500).json(result);
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload | string;

    if (typeof decoded === "string") {
      const result = OrchestrationResult.Failure({
        statusCode: EnumStatusCode.BAD_REQUEST,
        message: "Invalid token payload",
      });

      res.status(401).json(result);
      return;
    }

    const adminIdClaim = decoded.sub;

    if (!adminIdClaim || typeof adminIdClaim !== "string") {
      const result = OrchestrationResult.Failure({
        statusCode: EnumStatusCode.BAD_REQUEST,
        message: "Token does not contain admin id",
      });

      res.status(401).json(result);
      return;
    }

    req.adminId = adminIdClaim;

    if (decoded.email && typeof decoded.email === "string") {
      req.adminEmail = decoded.email;
    }

    next();
  } catch (error) {
    logger.warn("JWT verification failed in requireAdmin middleware", {
      error,
    });

    const result = OrchestrationResult.Failure({
      statusCode: EnumStatusCode.BAD_REQUEST,
      message: "Invalid or expired token",
    });

    res.status(401).json(result);
  }
}
