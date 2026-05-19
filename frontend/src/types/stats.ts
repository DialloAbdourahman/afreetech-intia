import type { OrchestrationResult } from "./orchestration";

export interface StatsDto {
  clientsCount: number;
  insurancesCount: number;
}

export type StatsResponse = OrchestrationResult<StatsDto>;
