import type { SxProps, Theme } from "@mui/material/styles";

export const emptyStateStyles: SxProps<Theme> = {
  py: 4,
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 1,
};

export const emptyStateIconStyles: SxProps<Theme> = {
  color: "text.secondary",
  mb: 1,
};

export const emptyStateTitleStyles: SxProps<Theme> = {
  fontWeight: 600,
};
