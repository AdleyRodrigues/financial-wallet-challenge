"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

type LoadingProps = {
  label?: string;
};

export function Loading({ label = "Carregando..." }: LoadingProps) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        py: 6,
        color: "text.secondary",
      }}
    >
      <CircularProgress color="primary" size={32} />
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
}
