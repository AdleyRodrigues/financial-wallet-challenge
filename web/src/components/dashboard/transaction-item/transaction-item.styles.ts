import type { SxProps, Theme } from "@mui/material/styles";
import type { Transaction } from "@/types/transaction";

export const listItemStyles: SxProps<Theme> = {
  py: 2,
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "flex-start", sm: "center" },
  gap: 2,
  borderBottom: 1,
  borderColor: "divider",
};

export const chipRowStyles: SxProps<Theme> = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 1,
  mb: 1,
};

export const descriptionStyles: SxProps<Theme> = {
  fontWeight: 600,
};

export const counterpartyStyles: SxProps<Theme> = {
  mt: 0.5,
};

export const dateStyles: SxProps<Theme> = {
  mt: 0.5,
  display: "block",
};

export const actionsStackStyles: SxProps<Theme> = {
  alignItems: { xs: "flex-start", sm: "flex-end" },
};

export function getAmountStyles(
  direction: Transaction["direction"],
): SxProps<Theme> {
  const isIncoming = direction === "IN";
  const isOutgoing = direction === "OUT";

  return {
    fontWeight: 700,
    color: isIncoming
      ? "primary.main"
      : isOutgoing
        ? "error.main"
        : "text.primary",
  };
}
