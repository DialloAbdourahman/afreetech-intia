import { apiRequest } from "./apiClient";
import type { OrchestrationResult } from "../types/orchestration";

export type AssuranceStatus = "active" | "expired";

export interface AssuranceDto {
  _id: string;
  client: string;
  type: string;
  policyNumber: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: AssuranceStatus;
}

export interface FetchAssurancesParams {
  clientId?: string;
  status?: AssuranceStatus;
  token: string;
}

export async function fetchAssurances(
  params: FetchAssurancesParams,
): Promise<OrchestrationResult<AssuranceDto[]>> {
  const { clientId, status, token } = params;
  const qs = new URLSearchParams();

  if (clientId) qs.set("clientId", clientId);
  if (status) qs.set("status", status);

  const query = qs.toString() ? `?${qs.toString()}` : "";

  return apiRequest<AssuranceDto[]>(`/api/assurances${query}`, { token });
}

export async function getAssuranceCountForClient(
  clientId: string,
  token: string,
): Promise<number> {
  const result = await fetchAssurances({ clientId, token });
  if (result.code !== "SUCCESS" || !result.data) {
    return 0;
  }
  return result.data.length;
}

export interface CreateAssurancePayload {
  clientId: string;
  type: string;
  policyNumber: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  amount: number;
  status: AssuranceStatus;
}

export async function createAssurance(
  payload: CreateAssurancePayload,
  token: string,
): Promise<OrchestrationResult<AssuranceDto>> {
  return apiRequest<AssuranceDto>("/api/assurances", {
    method: "POST",
    body: payload,
    token,
  });
}

export type UpdateAssurancePayload = Partial<
  Omit<CreateAssurancePayload, "clientId">
>;

export async function updateAssurance(
  id: string,
  payload: UpdateAssurancePayload,
  token: string,
): Promise<OrchestrationResult<AssuranceDto>> {
  return apiRequest<AssuranceDto>(`/api/assurances/${id}`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export async function deleteAssurance(
  id: string,
  token: string,
): Promise<OrchestrationResult<AssuranceDto>> {
  return apiRequest<AssuranceDto>(`/api/assurances/${id}`, {
    method: "DELETE",
    token,
  });
}
