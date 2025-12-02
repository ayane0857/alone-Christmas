'use client';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';
export const ThemeProvider = ({ children, ...props }: React.ComponentProps<typeof NextThemeProvider>) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null; // クライアント側でのみレンダリング
  return <NextThemeProvider {...props}>{children}</NextThemeProvider>;
};
