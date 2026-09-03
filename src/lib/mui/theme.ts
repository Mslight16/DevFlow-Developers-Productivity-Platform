import { createTheme } from "@mui/material/styles";

// Mirrors the CSS custom properties in src/app/globals.css so MUI
// components (Dialog, Menu, Select, Snackbar, etc.) share the exact
// same neumorphic design language as the rest of the app.
export const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#e4e9f2",
      paper: "#e4e9f2",
    },
    primary: {
      main: "#5b8def",
      dark: "#4a7bd9",
      contrastText: "#ffffff",
    },
    success: {
      main: "#3ecf8e",
    },
    warning: {
      main: "#e6a53f",
    },
    error: {
      main: "#e5615a",
    },
    text: {
      primary: "#2e3a59",
      secondary: "#7b8aa6",
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily:
      'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "6px 6px 14px #b8c2d6, -6px -6px 14px #ffffff",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
        },
      },
    },
  },
});