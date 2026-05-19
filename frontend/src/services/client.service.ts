import { apiRequest } from "./apiClient";
import type { OrchestrationResult } from "../types/orchestration";

export interface ClientDto {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  cniNumber: string;
  branch: string;
}

export interface FetchClientsParams {
  search?: string;
  branch?: string;
  token: string;
}

export async function fetchClients(
  params: FetchClientsParams,
): Promise<OrchestrationResult<ClientDto[]>> {
  const { search, branch, token } = params;
  const qs = new URLSearchParams();

  if (search) qs.set("search", search);
  if (branch) qs.set("branch", branch);

  const query = qs.toString() ? `?${qs.toString()}` : "";

  return apiRequest<ClientDto[]>(`/api/clients${query}`, { token });
}

export async function getClientById(
  id: string,
  token: string,
): Promise<OrchestrationResult<ClientDto>> {
  return apiRequest<ClientDto>(`/api/clients/${id}`, { token });
}

export interface CreateClientPayload {
  name: string;
  phone: string;
  email: string;
  address: string;
  cniNumber: string;
  branch: string;
}

export async function createClient(
  client: CreateClientPayload,
  token: string,
): Promise<OrchestrationResult<ClientDto>> {
  return apiRequest<ClientDto>("/api/clients", {
    method: "POST",
    body: client,
    token,
  });
}

export type UpdateClientPayload = Partial<
  Omit<CreateClientPayload, "cniNumber">
>;

export async function updateClient(
  id: string,
  client: UpdateClientPayload,
  token: string,
): Promise<OrchestrationResult<ClientDto>> {
  return apiRequest<ClientDto>(`/api/clients/${id}`, {
    method: "PUT",
    body: client,
    token,
  });
}

export async function deleteClient(
  id: string,
  token: string,
): Promise<OrchestrationResult<ClientDto>> {
  return apiRequest<ClientDto>(`/api/clients/${id}`, {
    method: "DELETE",
    token,
  });
}
