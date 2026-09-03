"use client";

import type { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@/lib/mui/theme";

// Wraps MUI's cache + theme providers in a single Client Component.
// The theme must be created and consumed entirely on the client side —
// creating it in a Server Component (layout.tsx) and passing it down
// as a prop fails, because createTheme() returns functions (e.g.
// theme.breakpoints.up) that can't be serialized across the
// server/client boundary.
export function ThemeRegistry({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppRouterCacheProvider>
  );
}