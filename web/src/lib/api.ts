import type { ApiFieldErrors } from "./api-errors";
import { resolveApiError } from "./api-errors";
import { API_ERROR_MESSAGES } from "./error-catalog";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors?: ApiFieldErrors,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      ...options,
      credentials: "include",
      headers,
    });
  } catch {
    throw new ApiError(0, API_ERROR_MESSAGES.common.connectionError);
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const resolvedError = resolveApiError({
      status: response.status,
      path,
      body,
    });
    throw new ApiError(
      response.status,
      resolvedError.message,
      resolvedError.fieldErrors,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
