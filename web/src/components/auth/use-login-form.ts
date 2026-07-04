"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiError } from "@/lib/api";
import { isValidEmail } from "@/lib/form";
import { authService } from "@/services/auth-service";

export function useLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = "Informe seu e-mail.";
    } else if (!isValidEmail(email)) {
      errors.email = "Informe um e-mail válido.";
    }

    if (!password) {
      errors.password = "Informe sua senha.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await authService.login({ email: email.trim(), password });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    email,
    password,
    fieldErrors,
    error,
    loading,
    setEmail,
    setPassword,
    handleSubmit,
  };
}
