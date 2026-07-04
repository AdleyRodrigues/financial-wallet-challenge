"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  emailStyles,
  greetingStyles,
  headerStackStyles,
  logoutButtonStyles,
  subtitleStyles,
} from "@/components/dashboard/dashboard-header/dashboard-header.styles";
import { Button } from "@/components/ui/button/button";
import type { User } from "@/types/auth";

type DashboardHeaderProps = {
  user: User;
  onLogout: () => void;
  loggingOut: boolean;
};

export function DashboardHeader({
  user,
  onLogout,
  loggingOut,
}: DashboardHeaderProps) {
  return (
    <Stack spacing={2} sx={headerStackStyles}>
      <Box>
        <Typography variant="body2" color="primary" sx={subtitleStyles}>
          Carteira digital
        </Typography>
        <Typography variant="h4" component="h1" sx={greetingStyles}>
          Olá, {user.name.split(" ")[0]}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={emailStyles}>
          {user.email}
        </Typography>
      </Box>

      <Button
        variant="outlined"
        color="inherit"
        onClick={onLogout}
        loading={loggingOut}
        sx={logoutButtonStyles}
      >
        Sair
      </Button>
    </Stack>
  );
}
