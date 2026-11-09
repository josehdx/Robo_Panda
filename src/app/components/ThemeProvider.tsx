"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "@teispace/next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider 
      {...props} 
      // Suppresses the React 19 / Next.js script tag warning
      scriptProps={{ type: "application/json" } as any}
    >
      {children}
    </NextThemesProvider>
  );
}