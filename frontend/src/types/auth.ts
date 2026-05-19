import type { OrchestrationResult } from "./orchestration";

export interface AdminDto {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponseData {
  accessToken: string;
  admin: AdminDto;
}

export type LoginResponse = OrchestrationResult<LoginResponseData>;
export type MeResponse = OrchestrationResult<AdminDto>;
