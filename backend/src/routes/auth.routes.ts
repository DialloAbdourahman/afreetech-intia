import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { Admin } from "../schemas/admin.schema";
import { OrchestrationResult } from "../utils/orchestration-result";
import { EnumStatusCode } from "../enums/response.status.code";
import { logger } from "../utils/winston";
import {
  requireAdmin,
  AuthenticatedAdminRequest,
} from "../middleware/require-admin";

const authRouter = Router();

interface LoginRequestBody {
  email?: string;
  password?: string;
}

authRouter.post(
  "/login",
  async (req: Request<unknown, unknown, LoginRequestBody>, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      const result = OrchestrationResult.Failure({
        statusCode: EnumStatusCode.BAD_REQUEST,
        message: "Email and password are required",
      });
      return res.status(400).json(result);
    }

    try {
      const normalizedEmail = email.toLowerCase().trim();

      const admin = await Admin.findOne({ email: normalizedEmail }).exec();

      if (!admin) {
        logger.warn("Admin login failed: email not found", {
          email: normalizedEmail,
        });
        const result = OrchestrationResult.Failure({
          statusCode: EnumStatusCode.NOT_FOUND,
          message: "Invalid credentials",
        });
        return res.status(404).json(result);
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        logger.warn("Admin login failed: invalid password", {
          email: normalizedEmail,
        });
        const result = OrchestrationResult.Failure({
          statusCode: EnumStatusCode.BAD_REQUEST,
          message: "Invalid credentials",
        });
        return res.status(400).json(result);
      }

      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        logger.error("JWT_SECRET is not defined in environment");
        const result = OrchestrationResult.Failure({
          statusCode: EnumStatusCode.INTERNAL_SERVER_ERROR,
          message: "Authentication is not configured",
        });
        return res.status(500).json(result);
      }

      const token = jwt.sign(
        {
          sub: admin._id.toString(),
          email: admin.email,
        },
        jwtSecret,
        {
          expiresIn: "1h",
        },
      );

      const result = OrchestrationResult.Success({
        statusCode: EnumStatusCode.RECOVERED_SUCCESSFULLY,
        message: "Login successful",
        data: {
          accessToken: token,
          admin: {
            id: admin._id,
            email: admin.email,
            name: admin.name,
          },
        },
      });

      return res.status(200).json(result);
    } catch (error) {
      logger.error("Error during admin login", { error, body: req.body });

      const result = OrchestrationResult.Failure({
        statusCode: EnumStatusCode.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      });

      return res.status(500).json(result);
    }
  },
);

// Get current admin info from token
authRouter.get(
  "/me",
  requireAdmin,
  async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const adminId = req.adminId;

      if (!adminId) {
        const result = OrchestrationResult.Failure({
          statusCode: EnumStatusCode.BAD_REQUEST,
          message: "Admin id not found in request context",
        });
        return res.status(400).json(result);
      }

      const admin = await Admin.findById(adminId).exec();

      if (!admin) {
        const result = OrchestrationResult.Failure({
          statusCode: EnumStatusCode.NOT_FOUND,
          message: "Admin not found",
        });
        return res.status(404).json(result);
      }

      const result = OrchestrationResult.Success({
        statusCode: EnumStatusCode.RECOVERED_SUCCESSFULLY,
        data: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
        },
      });

      return res.status(200).json(result);
    } catch (error) {
      logger.error("Error retrieving current admin info", {
        error,
        adminId: req.adminId,
      });

      const result = OrchestrationResult.Failure({
        statusCode: EnumStatusCode.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      });

      return res.status(500).json(result);
    }
  },
);

export default authRouter;
