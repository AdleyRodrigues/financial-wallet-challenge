"use client";

import MuiCard from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

type CardProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
};

export function Card({ title, description, children }: CardProps) {
  return (
    <MuiCard elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        {title ? (
          <Typography variant="h6" component="h2" gutterBottom>
            {title}
          </Typography>
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
