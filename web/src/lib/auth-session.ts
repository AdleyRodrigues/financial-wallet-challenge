const SESSION_EXPIRED_QUERY = "session-expired";

export function redirectToLoginOnUnauthorized(path: string): void {
  if (typeof window === "undefined") {
    return;
  }

  if (path === "/auth/login") {
    return;
  }

  if (path === "/auth/logout") {
    window.location.replace("/login");
    return;
  }

  window.location.replace(`/login?reason=${SESSION_EXPIRED_QUERY}`);
}

export function isSessionExpiredReason(reason: string | null): boolean {
  return reason === SESSION_EXPIRED_QUERY;
}
