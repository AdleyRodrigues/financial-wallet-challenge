-- Setup local PostgreSQL (sem Docker) — porta 5432
-- Execute como superusuário (postgres) no pgAdmin ou psql.

CREATE USER wallet_user WITH PASSWORD 'wallet_password';

CREATE DATABASE wallet_db OWNER wallet_user;

GRANT ALL PRIVILEGES ON DATABASE wallet_db TO wallet_user;

-- Conectar em wallet_db e rodar:
-- GRANT ALL ON SCHEMA public TO wallet_user;

-- Para modo local, use em api/.env:
-- DATABASE_URL="postgresql://wallet_user:wallet_password@localhost:5432/wallet_db?schema=public"
