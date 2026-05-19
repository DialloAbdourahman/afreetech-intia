import { Router, Response } from "express";
import {
  requireAdmin,
  AuthenticatedAdminRequest,
} from "../middleware/require-admin";
import { Client } from "../schemas/client.schema";
import { Insurance } from "../schemas/insurance.schema";
import { OrchestrationResult } from "../utils/orchestration-result";
import { EnumStatusCode } from "../enums/response.status.code";
import { logger } from "../utils/winston";

const statsRouter = Router();

statsRouter.get(
  "/counts",
  requireAdmin,
  async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const [clientsCount, insurancesCount] = await Promise.all([
        Client.countDocuments({}).exec(),
        Insurance.countDocuments({}).exec(),
      ]);

      const result = OrchestrationResult.Success({
        statusCode: EnumStatusCode.RECOVERED_SUCCESSFULLY,
        data: {
          clientsCount,
          insurancesCount,
        },
      });

      return res.status(200).json(result);
    } catch (error) {
      logger.error("Error fetching dashboard stats", {
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

export default statsRouter;
