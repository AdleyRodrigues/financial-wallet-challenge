"use client";

import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthPageLayout
      title="Criar conta"
      description="Cadastre-se para começar a usar sua carteira digital."
    >
      <RegisterForm />
    </AuthPageLayout>
  );
}
