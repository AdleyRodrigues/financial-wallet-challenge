import type { SxProps, Theme } from "@mui/material/styles";

export const pageMainStyles: SxProps<Theme> = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  py: 5,
};

export const headerStackStyles: SxProps<Theme> = {
  alignItems: "center",
  mb: 4,
  textAlign: "center",
};

export const formPaperStyles: SxProps<Theme> = {
  p: { xs: 3, sm: 4 },
  borderRadius: 3,
  border: 1,
  borderColor: "divider",
};
