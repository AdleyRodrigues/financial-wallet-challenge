"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiError } from "@/lib/api";
import { isValidEmail } from "@/lib/form";
import { authService } from "@/services/auth-service";

export function useRegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    const errors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) {
      errors.name = "Informe seu nome.";
    }

    if (!email.trim()) {
      errors.email = "Informe seu e-mail.";
    } else if (!isValidEmail(email)) {
      errors.email = "Informe um e-mail válido.";
    }

    if (!password) {
      errors.password = "Informe uma senha.";
    } else if (password.length < 6) {
      errors.password = "A senha deve ter pelo menos 6 caracteres.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setSuccess("Conta criada com sucesso. Redirecionando para o login...");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Não foi possível criar a conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return {
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
  };
}
