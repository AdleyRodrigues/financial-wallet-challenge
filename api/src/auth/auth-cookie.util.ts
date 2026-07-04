import type { CookieOptions } from 'express';

const DEFAULT_JWT_EXPIRES_IN = '2h';

const EXPIRES_IN_PATTERN = /^(\d+)(s|m|h|d)$/i;

export function getJwtExpiresIn(configValue?: string): string {
  const trimmed = configValue?.trim();
  return trimmed && EXPIRES_IN_PATTERN.test(trimmed)
    ? trimmed
    : DEFAULT_JWT_EXPIRES_IN;
}

export function parseExpiresInToMs(expiresIn: string): number {
  const match = EXPIRES_IN_PATTERN.exec(expiresIn.trim());

  if (!match) {
    return parseExpiresInToMs(DEFAULT_JWT_EXPIRES_IN);
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return value * multipliers[unit];
}

export function buildAuthCookieOptions(
  expiresIn: string,
  isProduction: boolean,
): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: parseExpiresInToMs(expiresIn),
  };
}
