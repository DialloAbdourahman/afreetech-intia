import { apiRequest } from "./apiClient";
import type { StatsDto, StatsResponse } from "../types/stats";

export async function getStats(token: string): Promise<StatsResponse> {
  return apiRequest<StatsDto>("/api/stats/counts", { token });
}
