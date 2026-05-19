export type EnumStatusResponse = "SUCCESS" | "FAILURE";

export interface OrchestrationResult<T = unknown> {
  code: EnumStatusResponse;
  statusCode: string;
  message: string | null;
  data: T | null;
}
