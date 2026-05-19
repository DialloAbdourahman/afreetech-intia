import { Router, Response } from "express";

import { Client } from "../schemas/client.schema";
import {
  requireAdmin,
  AuthenticatedAdminRequest,
} from "../middleware/require-admin";
import { OrchestrationResult } from "../utils/orchestration-result";
import { EnumStatusCode } from "../enums/response.status.code";
import { logger } from "../utils/winston";

const clientRouter = Router();

// Create client
clientRouter.post(
  "/",
  requireAdmin,
  async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const { name, phone, email, address, cniNumber, branch } = req.body;

      if (!name || !phone || !email || !address || !cniNumber || !branch) {
        const result = OrchestrationResult.Failure({
          statusCode: EnumStatusCode.BAD_REQUEST,
          message: "Missing required client fields",
        });
        return res.status(400).json(result);
      }

      const existingByCni = await Client.findOne({ cniNumber }).exec();
      if (existingByCni) {
        const result = OrchestrationResult.Failure({
          statusCode: EnumStatusCode.BAD_REQUEST,
          message: "A client with this CNI number already exists",
        });
        return res.status(400).json(result);
      }

      const client = await Client.create({
        name,
        phone,
        email,
        address,
        cniNumber,
        branch,
      });

      const result = OrchestrationResult.Success({
        statusCode: EnumStatusCode.CREATED_SUCCESSFULLY,
        message: "Client created successfully",
        data: client,
      });

      return res.status(201).json(result);
    } catch (error) {
      logger.error("Error creating client", {
        error,
        body: req.body,
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

// List clients with optional search
clientRouter.get(
  "/",
  requireAdmin,
  async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const { search, branch } = req.query as {
        search?: string;
        branch?: string;
      };

      const filter: Record<string, unknown> = {};

      if (branch) {
        filter.branch = branch;
      }

      if (search) {
        const regex = new RegExp(search, "i");
        filter.$or = [
          { name: regex },
          { phone: regex },
          { email: regex },
          { cniNumber: regex },
        ];
      }

      const clients = await Client.find(filter).sort({ createdAt: -1 }).exec();

      const result = OrchestrationResult.Success({
        statusCode: EnumStatusCode.RECOVERED_SUCCESSFULLY,
        data: clients,
      });

      return res.status(200).json(result);
    } catch (error) {
      logger.error("Error listing clients", { error, adminId: req.adminId });

      const result = OrchestrationResult.Failure({
        statusCode: EnumStatusCode.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      });

      return res.status(500).json(result);
    }
  },
);

// Get client by ID
clientRouter.get(
  "/:id",
  requireAdmin,
  async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const { id } = req.params;

      const client = await Client.findById(id).exec();

      if (!client) {
        const result = OrchestrationResult.Failure({
          statusCode: EnumStatusCode.NOT_FOUND,
          message: "Client not found",
        });
        return res.status(404).json(result);
      }

      const result = OrchestrationResult.Success({
        statusCode: EnumStatusCode.RECOVERED_SUCCESSFULLY,
        data: client,
      });

      return res.status(200).json(result);
    } catch (error) {
      logger.error("Error retrieving client", {
        error,
        adminId: req.adminId,
        params: req.params,
      });

      const result = OrchestrationResult.Failure({
        statusCode: EnumStatusCode.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      });

      return res.status(500).json(result);
    }
  },
);

// Update client
clientRouter.put(
  "/:id",
  requireAdmin,
  async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, phone, email, address, branch } = req.body;

      const client = await Client.findById(id).exec();

      if (!client) {
        const result = OrchestrationResult.Failure({
          statusCode: EnumStatusCode.NOT_FOUND,
          message: "Client not found",
        });
        return res.status(404).json(result);
      }

      if (name !== undefined) client.name = name;
      if (phone !== undefined) client.phone = phone;
      if (email !== undefined) client.email = email;
      if (address !== undefined) client.address = address;
      if (branch !== undefined) client.branch = branch;

      await client.save();

      const result = OrchestrationResult.Success({
        statusCode: EnumStatusCode.UPDATED_SUCCESSFULLY,
        message: "Client updated successfully",
        data: client,
      });

      return res.status(200).json(result);
    } catch (error) {
      logger.error("Error updating client", {
        error,
        adminId: req.adminId,
        params: req.params,
        body: req.body,
      });

      const result = OrchestrationResult.Failure({
        statusCode: EnumStatusCode.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      });

      return res.status(500).json(result);
    }
  },
);

// Delete client
clientRouter.delete(
  "/:id",
  requireAdmin,
  async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const { id } = req.params;

      const client = await Client.findByIdAndDelete(id).exec();

      if (!client) {
        const result = OrchestrationResult.Failure({
          statusCode: EnumStatusCode.NOT_FOUND,
          message: "Client not found",
        });
        return res.status(404).json(result);
      }

      const result = OrchestrationResult.Success({
        statusCode: EnumStatusCode.DELETED_SUCCESSFULLY,
        message: "Client deleted successfully",
        data: client,
      });

      return res.status(200).json(result);
    } catch (error) {
      logger.error("Error deleting client", {
        error,
        adminId: req.adminId,
        params: req.params,
      });

      const result = OrchestrationResult.Failure({
        statusCode: EnumStatusCode.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      });

      return res.status(500).json(result);
    }
  },
);

export default clientRouter;
