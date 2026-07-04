const API_ERROR_MAP: Record<string, string> = {
  "Invalid credentials": "E-mail ou senha inválidos.",
  "Email already in use": "Este e-mail já está em uso.",
  "Insufficient balance": "Saldo insuficiente para esta operação.",
  "Cannot transfer to yourself": "Não é possível transferir para você mesmo.",
  "Receiver not found": "Destinatário não encontrado.",
  "Transaction not found": "Transação não encontrada.",
  "Transaction already reversed": "Esta transação já foi revertida.",
  "Reversal transactions cannot be reversed":
    "Transações de reversão não podem ser revertidas.",
  "You can only reverse transactions you originated":
    "Você só pode reverter transações que você originou.",
  "Amount must be greater than zero": "O valor deve ser maior que zero.",
  "User not found": "Usuário não encontrado.",
  "Wallet not found": "Carteira não encontrada.",
  Unauthorized: "Sessão expirada. Faça login novamente.",
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function translateError(message: string): string {
  if (API_ERROR_MAP[message]) {
    return API_ERROR_MAP[message];
  }

  if (/^[A-Za-z]/.test(message)) {
    return "Ocorreu um erro inesperado. Tente novamente.";
  }

  return message;
}

function extractErrorMessage(body: unknown): string {
  if (!body || typeof body !== "object") {
    return "Ocorreu um erro inesperado. Tente novamente.";
  }

  const record = body as { message?: string | string[] };

  if (Array.isArray(record.message)) {
    return record.message.map(translateError).join(" ");
  }

  if (typeof record.message === "string") {
    return translateError(record.message);
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
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

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);

    if (response.status === 401) {
      throw new ApiError(401, "Sessão expirada. Faça login novamente.");
    }

    throw new ApiError(response.status, extractErrorMessage(body));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
