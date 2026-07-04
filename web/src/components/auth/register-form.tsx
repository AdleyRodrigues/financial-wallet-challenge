"use client";

import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { footerTextStyles } from "@/components/auth/login-form.styles";
import { useRegisterForm } from "@/components/auth/use-register-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const {
    name,
    email,
    password,
    fieldErrors,
    error,
    success,
    loading,
    setName,
    setEmail,
    setPassword,
    handleSubmit,
  } = useRegisterForm();

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit} noValidate>
      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      <Input
        label="Nome"
        name="name"
        autoComplete="name"
        placeholder="Seu nome"
        value={name}
        onChange={(event) => setName(event.target.value)}
        errorMessage={fieldErrors.name}
      />

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
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo 6 caracteres"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        errorMessage={fieldErrors.password}
      />

      <Button type="submit" variant="contained" fullWidth loading={loading}>
        Criar conta
      </Button>

      <Typography variant="body2" color="text.secondary" sx={footerTextStyles}>
        Já tem conta?{" "}
        <Link component={NextLink} href="/login" underline="hover" color="primary">
          Entrar
        </Link>
      </Typography>
    </Stack>
  );
}
