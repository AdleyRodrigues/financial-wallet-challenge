"use client";

import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthPageLayout
      title="Entrar"
      description="Acesse sua conta para gerenciar saldo e transações."
    >
      <LoginForm />
    </AuthPageLayout>
  );
}
