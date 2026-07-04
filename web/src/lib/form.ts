const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function parsePositiveAmount(raw: string): number | null {
  const normalized = raw.replace(",", ".").trim();

  if (!normalized) {
    return null;
  }

  const amount = parseFloat(normalized);

  if (Number.isNaN(amount) || amount <= 0) {
    return null;
  }

  return amount;
}
