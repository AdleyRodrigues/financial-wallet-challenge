const fallbackDatabaseUrl =
  'postgresql://wallet_user:wallet_password@localhost:5433/wallet_db?schema=public';

const fallbackTestDatabaseUrl =
  'postgresql://wallet_user:wallet_password@localhost:5433/wallet_db?schema=public';

process.env.DATABASE_URL =
  process.env.DATABASE_URL_TEST ??
  process.env.DATABASE_URL ??
  fallbackTestDatabaseUrl ??
  fallbackDatabaseUrl;

process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'change-me';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '2h';
process.env.FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
