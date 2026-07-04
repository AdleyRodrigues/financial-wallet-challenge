"use client";

import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  brandRowStyles,
  brandTitleStyles,
  getBrandIconSize,
  getBrandIconStyles,
} from "@/components/ui/brand-mark/brand-mark.styles";

type BrandMarkProps = {
  showTitle?: boolean;
  size?: "sm" | "md";
};

export function BrandMark({ showTitle = true, size = "md" }: BrandMarkProps) {
  return (
    <Stack sx={brandRowStyles}>
      <Box sx={getBrandIconStyles(size)}>
        <AccountBalanceWallet fontSize={getBrandIconSize(size)} />
      </Box>
      {showTitle ? (
        <Typography sx={brandTitleStyles}>Carteira Digital</Typography>
      ) : null}
    </Stack>
  );
}
