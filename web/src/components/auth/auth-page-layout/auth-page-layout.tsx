"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import {
  brandIconStyles,
  brandRowStyles,
  brandTitleStyles,
  formPaperStyles,
  headerStackStyles,
  pageMainStyles,
} from "@/components/auth/auth-page-layout/auth-page-layout.styles";

type AuthPageLayoutProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthPageLayout({
  title,
  description,
  children,
}: AuthPageLayoutProps) {
  return (
    <Box component="main" sx={pageMainStyles}>
      <Container maxWidth="sm">
        <Stack spacing={3} sx={headerStackStyles}>
          <Link component={NextLink} href="/" underline="none" color="primary">
            <Stack spacing={1} sx={brandRowStyles}>
              <Box sx={brandIconStyles}>C</Box>
              <Typography sx={brandTitleStyles}>Carteira Digital</Typography>
            </Stack>
          </Link>
          <Typography variant="h4" component="h1">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>

        <Paper elevation={0} sx={formPaperStyles}>
          {children}
        </Paper>
      </Container>
    </Box>
  );
}
