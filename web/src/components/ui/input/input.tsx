"use client";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MuiTextField, { type TextFieldProps } from "@mui/material/TextField";
import { useState } from "react";

type InputProps = TextFieldProps & {
  label: string;
  errorMessage?: string;
  showPasswordToggle?: boolean;
};

export function Input({
  label,
  error,
  errorMessage,
  helperText,
  showPasswordToggle = false,
  type,
  slotProps,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const message = errorMessage ?? (typeof error === "string" ? error : helperText);
  const hasError = Boolean(errorMessage) || Boolean(error);

  const resolvedType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;

  const passwordAdornment = showPasswordToggle ? (
    <InputAdornment position="end">
      <IconButton
        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        onClick={() => setShowPassword((current) => !current)}
        onMouseDown={(event) => event.preventDefault()}
        edge="end"
        size="small"
      >
        {showPassword ? (
          <VisibilityOff fontSize="small" />
        ) : (
          <Visibility fontSize="small" />
        )}
      </IconButton>
    </InputAdornment>
  ) : undefined;

  const mergedSlotProps: TextFieldProps["slotProps"] = {
    ...slotProps,
    input: {
      ...(typeof slotProps?.input === "object" ? slotProps.input : {}),
      ...(passwordAdornment ? { endAdornment: passwordAdornment } : {}),
    },
  };

  return (
    <MuiTextField
      label={label}
      fullWidth
      error={hasError}
      helperText={message}
      type={resolvedType}
      slotProps={mergedSlotProps}
      {...props}
    />
  );
}
