import { apiRequest } from "./apiClient";
import type {
  LoginResponse,
  MeResponse,
  LoginResponseData,
  AdminDto,
} from "../types/auth";

export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiRequest<LoginResponseData>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}

export async function getMe(token: string): Promise<MeResponse> {
  return apiRequest<AdminDto>("/api/auth/me", {
    token,
  });
}
