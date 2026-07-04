"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import {
  formPaperStyles,
  headerStackStyles,
  pageMainStyles,
} from "@/components/auth/auth-page-layout/auth-page-layout.styles";
import { BrandMark } from "@/components/ui/brand-mark/brand-mark";

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
      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack spacing={3} sx={headerStackStyles}>
          <Link component={NextLink} href="/" underline="none" color="primary">
            <BrandMark />
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
