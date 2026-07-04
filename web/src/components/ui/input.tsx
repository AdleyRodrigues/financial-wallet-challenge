"use client";

import MuiTextField, { type TextFieldProps } from "@mui/material/TextField";

type InputProps = TextFieldProps & {
  label: string;
  errorMessage?: string;
};

export function Input({ label, error, errorMessage, helperText, ...props }: InputProps) {
  const message = errorMessage ?? (typeof error === "string" ? error : helperText);
  const hasError = Boolean(errorMessage) || Boolean(error);

  return (
    <MuiTextField
      label={label}
      fullWidth
      error={hasError}
      helperText={message}
      {...props}
    />
  );
}
