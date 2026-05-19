import { Router, Response } from "express";

import { Insurance } from "../schemas/insurance.schema";
import { Client } from "../schemas/client.schema";
import {
  requireAdmin,
  AuthenticatedAdminRequest,
} from "../middleware/require-admin";
import { OrchestrationResult } from "../utils/orchestration-result";
import { EnumStatusCode } from "../enums/response.status.code";
import { logger } from "../utils/winston";

const assurancesRouter = Router();

// Create an assurance for a client
assurancesRouter.post(
  "/",
  requireAdmin,
  async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const {
        clientId,
        type,
        policyNumber,
        startDate,
        endDate,
        amount,
        status,
      } = req.body;

      if (
        !clientId ||
        !type ||
        !policyNumber ||
        !startDate ||
        !endDate ||
        amount == null
      ) {
        const result = OrchestrationResult.Failure({
          statusCode: EnumStatusCode.BAD_REQUEST,
          message: "Missing required assurance fields",
        });
        return res.status(400).json(result);
      }

      const client = await Client.findById(clientId).exec();
      if (!client) {
        const result = OrchestrationResult.Failure({
          statusCode: EnumStatusCode.NOT_FOUND,
          message: "Client not found",
        });
        return res.status(404).json(result);
      }

      const existingByPolicy = await Insurance.findOne({ policyNumber }).exec();
      if (existingByPolicy) {
        const result = OrchestrationResult.Failure({
          statusCode: EnumStatusCode.BAD_REQUEST,
          message: "An assurance with this policy number already exists",
        });
        return res.status(400).json(result);
      }

      const assurance = await Insurance.create({
        client: client._id,
        type,
        policyNumber,
        startDate,
        endDate,
        amount,
        status,
      });

      const result = OrchestrationResult.Success({
        statusCode: EnumStatusCode.CREATED_SUCCESSFULLY,
        message: "Assurance created successfully",
        data: assurance,
      });

      return res.status(201).json(result);
    } catch (error) {
      logger.error("Error creating assurance", {
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

// List assurances with optional filters (by client and/or status)
assurancesRouter.get(
  "/",
  requireAdmin,
  async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const { clientId, status } = req.query as {
        clientId?: string;
        status?: string;
      };

      const filter: Record<string, unknown> = {};

      if (clientId) {
        filter.client = clientId;
      }

      if (status) {
        filter.status = status;
      }

      const assurances = await Insurance.find(filter)
        .sort({ createdAt: -1 })
        .exec();

      const result = OrchestrationResult.Success({
        statusCode: EnumStatusCode.RECOVERED_SUCCESSFULLY,
        data: assurances,
      });

      return res.status(200).json(result);
    } catch (error) {
      logger.error("Error listing assurances", {
        error,
        adminId: req.adminId,
        query: req.query,
      });

      const result = OrchestrationResult.Failure({
        statusCode: EnumStatusCode.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      });

      return res.status(500).json(result);
    }
  },
);

// Get assurance by ID
assurancesRouter.get(
  "/:id",
  requireAdmin,
  async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const { id } = req.params;

      const assurance = await Insurance.findById(id).exec();

      if (!assurance) {
        const result = OrchestrationResult.Failure({
          statusCode: EnumStatusCode.NOT_FOUND,
          message: "Assurance not found",
        });
        return res.status(404).json(result);
      }

      const result = OrchestrationResult.Success({
        statusCode: EnumStatusCode.RECOVERED_SUCCESSFULLY,
        data: assurance,
      });

      return res.status(200).json(result);
    } catch (error) {
      logger.error("Error retrieving assurance", {
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

// Update assurance
assurancesRouter.put(
  "/:id",
  requireAdmin,
  async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { type, policyNumber, startDate, endDate, amount, status } =
        req.body;

      const assurance = await Insurance.findById(id).exec();

      if (!assurance) {
        const result = OrchestrationResult.Failure({
          statusCode: EnumStatusCode.NOT_FOUND,
          message: "Assurance not found",
        });
        return res.status(404).json(result);
      }

      if (policyNumber && policyNumber !== assurance.policyNumber) {
        const existingByPolicy = await Insurance.findOne({
          policyNumber,
        }).exec();
        if (existingByPolicy) {
          const result = OrchestrationResult.Failure({
            statusCode: EnumStatusCode.BAD_REQUEST,
            message: "An assurance with this policy number already exists",
          });
          return res.status(400).json(result);
        }
        assurance.policyNumber = policyNumber;
      }

      if (type !== undefined) assurance.type = type;
      if (startDate !== undefined) assurance.startDate = startDate;
      if (endDate !== undefined) assurance.endDate = endDate;
      if (amount !== undefined) assurance.amount = amount;
      if (status !== undefined) assurance.status = status;

      await assurance.save();

      const result = OrchestrationResult.Success({
        statusCode: EnumStatusCode.UPDATED_SUCCESSFULLY,
        message: "Assurance updated successfully",
        data: assurance,
      });

      return res.status(200).json(result);
    } catch (error) {
      logger.error("Error updating assurance", {
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

// Delete assurance
assurancesRouter.delete(
  "/:id",
  requireAdmin,
  async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const { id } = req.params;

      const assurance = await Insurance.findByIdAndDelete(id).exec();

      if (!assurance) {
        const result = OrchestrationResult.Failure({
          statusCode: EnumStatusCode.NOT_FOUND,
          message: "Assurance not found",
        });
        return res.status(404).json(result);
      }

      const result = OrchestrationResult.Success({
        statusCode: EnumStatusCode.DELETED_SUCCESSFULLY,
        message: "Assurance deleted successfully",
        data: assurance,
      });

      return res.status(200).json(result);
    } catch (error) {
      logger.error("Error deleting assurance", {
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

export default assurancesRouter;
