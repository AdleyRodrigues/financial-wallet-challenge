"use client";

import MuiButton, { type ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

type AppButtonProps = ButtonProps & {
  loading?: boolean;
};

export function Button({
  loading = false,
  disabled,
  children,
  ...props
}: AppButtonProps) {
  return (
    <MuiButton disabled={disabled || loading} {...props}>
      {loading ? (
        <>
          <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
          Carregando...
        </>
      ) : (
        children
      )}
    </MuiButton>
  );
}
