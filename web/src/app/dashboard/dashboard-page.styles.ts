import type { SxProps, Theme } from "@mui/material/styles";

export const mainStyles: SxProps<Theme> = {
  minHeight: "100vh",
  py: { xs: 3, sm: 4 },
};

export const loadingContainerStyles: SxProps<Theme> = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
};
