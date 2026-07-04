"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#22c55e",
      dark: "#16a34a",
      contrastText: "#020617",
    },
    secondary: {
      main: "#334155",
    },
    background: {
      default: "#020617",
      paper: "#0f172a",
    },
    error: {
      main: "#f87171",
    },
    success: {
      main: "#22c55e",
    },
    warning: {
      main: "#fbbf24",
    },
    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
    },
    divider: "#1e293b",
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #1e293b",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "medium",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#0f172a",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#334155",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#475569",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#22c55e",
            borderWidth: 1,
          },
          "&.Mui-focused": {
            boxShadow: "0 0 0 1px #22c55e",
          },
          "&.Mui-disabled": {
            opacity: 0.6,
          },
        },
        input: {
          padding: "14px 14px",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#94a3b8",
          "&.Mui-focused": {
            color: "#22c55e",
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: "#94a3b8",
          marginTop: 6,
          "&.Mui-error": {
            color: "#f87171",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 8,
        },
      },
    },
  },
});
