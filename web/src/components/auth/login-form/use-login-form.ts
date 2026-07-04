"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiError } from "@/lib/api";
import { API_ERROR_MESSAGES } from "@/lib/error-catalog";
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
      errors.email = API_ERROR_MESSAGES.validation.emptyEmail;
    } else if (!isValidEmail(email)) {
      errors.email = API_ERROR_MESSAGES.validation.invalidEmail;
    }

    if (!password) {
      errors.password = API_ERROR_MESSAGES.validation.emptyPassword;
    } else if (password.length < 6) {
      errors.password = API_ERROR_MESSAGES.validation.shortPassword;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

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
        if (err.fieldErrors) {
          setFieldErrors((previous) => ({ ...previous, ...err.fieldErrors }));
        }
        setError(err.message);
      } else {
        setError(API_ERROR_MESSAGES.auth.loginFailed);
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
