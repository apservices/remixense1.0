import React, { ReactNode } from "react";

import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import AppBottomNav from "@/components/AppBottomNav";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main role="main" className="min-h-[100svh] pb-24">
        {children}
      </main>
      <AppBottomNav />
      <PWAInstallPrompt />
    </div>
  );
}
