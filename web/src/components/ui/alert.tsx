"use client";

import MuiAlert from "@mui/material/Alert";

type AlertProps = {
  variant?: "error" | "success" | "info";
  children: React.ReactNode;
};

export function Alert({ variant = "info", children }: AlertProps) {
  const severity =
    variant === "error" ? "error" : variant === "success" ? "success" : "info";

  return (
    <MuiAlert severity={severity} sx={{ borderRadius: 2 }}>
      {children}
    </MuiAlert>
  );
}
