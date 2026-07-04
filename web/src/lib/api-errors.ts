import { API_ERROR_MAP, API_ERROR_MESSAGES } from "./error-catalog";

export type ApiFieldErrors = Record<string, string>;

function extractMessages(body: unknown): string[] {
  if (!body || typeof body !== "object") {
    return [];
  }

  const record = body as { message?: string | string[] };
  if (Array.isArray(record.message)) {
    return record.message.filter((message): message is string =>
      typeof message === "string",
    );
  }

  if (typeof record.message === "string") {
    return [record.message];
  }

  return [];
}

function translateMessage(message: string): string {
  return API_ERROR_MAP[message] ?? message;
}

function inferField(message: string): string | null {
  if (message.includes("receiverEmail")) {
    return "receiverEmail";
  }
  if (message.includes("email")) {
    return "email";
  }
  if (message.includes("password")) {
    return "password";
  }
  if (message.includes("name")) {
    return "name";
  }
  if (message.includes("amount")) {
    return "amount";
  }
  if (message.includes("description")) {
    return "description";
  }
  return null;
}

function parseFieldErrors(messages: string[]): ApiFieldErrors | undefined {
  const fieldErrors: ApiFieldErrors = {};

  for (const message of messages) {
    const field = inferField(message);
    if (!field) {
      continue;
    }

    if (!fieldErrors[field]) {
      fieldErrors[field] = translateMessage(message);
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

type ResolveApiErrorInput = {
  status: number;
  path: string;
  body: unknown;
};

type ResolvedApiError = {
  message: string;
  fieldErrors?: ApiFieldErrors;
};

export function resolveApiError({
  status,
  path,
  body,
}: ResolveApiErrorInput): ResolvedApiError {
  const rawMessages = extractMessages(body);
  const translatedMessages = rawMessages.map(translateMessage);
  const translatedMessage = translatedMessages.join(" ");
  const fieldErrors = parseFieldErrors(rawMessages);

  if (status === 401) {
    if (
      path === "/auth/login" &&
      rawMessages.some((message) => message === "Invalid credentials")
    ) {
      return { message: API_ERROR_MESSAGES.auth.invalidCredentials };
    }

    return { message: API_ERROR_MESSAGES.auth.sessionExpired };
  }

  if (translatedMessage) {
    return {
      message: translatedMessage,
      fieldErrors,
    };
  }

  if (status === 400) {
    return {
      message: API_ERROR_MESSAGES.validation.invalidData,
      fieldErrors,
    };
  }

  if (status === 404) {
    return { message: API_ERROR_MESSAGES.resource.notFound };
  }

  if (status >= 500) {
    return { message: API_ERROR_MESSAGES.common.serverError };
  }

  return { message: API_ERROR_MESSAGES.common.unexpectedError };
}
