"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "@/components/dashboard/dashboard-navbar";
import {
  DashboardThemeProvider,
  useDashboardTheme,
} from "@/contexts/dashboard-theme-context";
import { useAuth } from "@/contexts/auth-context";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, mounted } = useDashboardTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Apply theme class to html element for HeroUI components (portals, dropdowns, etc.)
  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;
    
    // Remove both classes first
    html.classList.remove("light", "dark");
    // Add the resolved theme
    html.classList.add(resolvedTheme);

    // Cleanup: restore light theme when leaving dashboard
    return () => {
      html.classList.remove("light", "dark");
      html.classList.add("light");
    };
  }, [resolvedTheme, mounted]);

  // Show loading state while checking auth or mounting theme
  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Don't render dashboard content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNavbar />
      <main className="w-full px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardThemeProvider>
      <DashboardContent>{children}</DashboardContent>
    </DashboardThemeProvider>
  );
}
