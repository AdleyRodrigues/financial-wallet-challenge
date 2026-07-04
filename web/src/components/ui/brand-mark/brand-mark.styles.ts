import type { SxProps, Theme } from "@mui/material/styles";

export const brandRowStyles: SxProps<Theme> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 1,
};

export function getBrandIconStyles(size: "sm" | "md"): SxProps<Theme> {
  const dimension = size === "sm" ? 28 : 32;

  return {
    width: dimension,
    height: dimension,
    borderRadius: 2,
    bgcolor: "primary.main",
    color: "primary.contrastText",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  };
}

export function getBrandIconSize(size: "sm" | "md"): "small" | "medium" {
  return size === "sm" ? "small" : "medium";
}

export const brandTitleStyles: SxProps<Theme> = {
  fontWeight: 600,
};
