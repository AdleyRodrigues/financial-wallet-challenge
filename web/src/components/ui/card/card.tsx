"use client";

import MuiCard from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type CardProps = {
  title?: string;
  titleIcon?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
};

export function Card({ title, titleIcon, description, children }: CardProps) {
  return (
    <MuiCard elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        {title ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {titleIcon ? (
              <Stack component="span" aria-hidden sx={{ color: "primary.main", display: "flex" }}>
                {titleIcon}
              </Stack>
            ) : null}
            <Typography variant="h6" component="h2" gutterBottom={Boolean(description)}>
              {title}
            </Typography>
          </Stack>
        ) : null}
        {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
        ) : null}
        {children}
      </CardContent>
    </MuiCard>
  );
}
