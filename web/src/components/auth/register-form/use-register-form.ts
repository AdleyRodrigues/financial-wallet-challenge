"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiError } from "@/lib/api";
import { API_ERROR_MESSAGES } from "@/lib/error-catalog";
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
      errors.name = API_ERROR_MESSAGES.validation.emptyName;
    }

    if (!email.trim()) {
      errors.email = API_ERROR_MESSAGES.validation.emptyEmail;
    } else if (!isValidEmail(email)) {
      errors.email = API_ERROR_MESSAGES.validation.invalidEmail;
    }

    if (!password) {
      errors.password = API_ERROR_MESSAGES.validation.emptyRegisterPassword;
    } else if (password.length < 6) {
      errors.password = API_ERROR_MESSAGES.validation.shortPassword;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

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
      setSuccess(API_ERROR_MESSAGES.auth.registerSuccess);
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) {
          setFieldErrors((previous) => ({ ...previous, ...err.fieldErrors }));
        }
        setError(err.message);
      } else {
        setError(API_ERROR_MESSAGES.auth.registerFailed);
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
