"use client";

import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { footerTextStyles } from "@/components/auth/shared/auth-form.styles";
import { useLoginForm } from "@/components/auth/login-form/use-login-form";
import { Alert } from "@/components/ui/alert/alert";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";

export function LoginForm() {
  const {
    email,
    password,
    fieldErrors,
    error,
    loading,
    setEmail,
    setPassword,
    handleSubmit,
  } = useLoginForm();

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit} noValidate>
      {error ? <Alert variant="error">{error}</Alert> : null}

      <Input
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        errorMessage={fieldErrors.email}
      />

      <Input
        label="Senha"
        name="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        errorMessage={fieldErrors.password}
        showPasswordToggle
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        loading={loading}
        loadingLabel="Entrando..."
      >
        Entrar
      </Button>

      <Typography variant="body2" color="text.secondary" sx={footerTextStyles}>
        Ainda não tem conta?{" "}
        <Link component={NextLink} href="/register" underline="hover" color="primary">
          Criar conta
        </Link>
      </Typography>
    </Stack>
  );
}
