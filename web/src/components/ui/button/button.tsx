"use client";

import MuiButton, { type ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

type AppButtonProps = ButtonProps & {
  loading?: boolean;
  loadingLabel?: string;
};

export function Button({
  loading = false,
  loadingLabel,
  disabled,
  children,
  ...props
}: AppButtonProps) {
  return (
    <MuiButton disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading ? (
        <>
          <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
          {loadingLabel ?? "Carregando..."}
        </>
      ) : (
        children
      )}
    </MuiButton>
  );
}
