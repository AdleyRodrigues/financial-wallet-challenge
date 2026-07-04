import type { SxProps, Theme } from "@mui/material/styles";

export const headerStackStyles: SxProps<Theme> = {
  flexDirection: { xs: "column", sm: "row" },
  justifyContent: "space-between",
  alignItems: { xs: "flex-start", sm: "center" },
  borderBottom: 1,
  borderColor: "divider",
  pb: 3,
};

export const subtitleStyles: SxProps<Theme> = {
  fontWeight: 600,
};

export const greetingStyles: SxProps<Theme> = {
  mt: 0.5,
};

export const emailStyles: SxProps<Theme> = {
  mt: 0.5,
};

export const logoutButtonStyles: SxProps<Theme> = {
  width: { xs: "100%", sm: "auto" },
};
