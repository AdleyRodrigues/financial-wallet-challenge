import type { SxProps, Theme } from "@mui/material/styles";

export const paperStyles: SxProps<Theme> = {
  position: "relative",
  overflow: "hidden",
  p: { xs: 3, sm: 4 },
  borderRadius: 3,
  border: 1,
  borderColor: "divider",
  background: (theme) =>
    `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 60%, rgba(34, 197, 94, 0.08) 100%)`,
};

export const overlineStyles: SxProps<Theme> = {
  letterSpacing: 1.2,
};

export function getBalanceAmountStyles(isNegative: boolean): SxProps<Theme> {
  return {
    mt: 1,
    fontWeight: 700,
    color: isNegative ? "error.main" : "primary.main",
  };
}

export const balanceHintStyles: SxProps<Theme> = {
  mt: 1.5,
  maxWidth: 480,
};

export const glowDecorationStyles: SxProps<Theme> = {
  position: "absolute",
  top: -32,
  right: -32,
  width: 128,
  height: 128,
  borderRadius: "50%",
  bgcolor: "primary.main",
  opacity: 0.08,
};
