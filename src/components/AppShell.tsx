import React, { ReactNode } from "react";
import Header from "@/components/Header";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import AppBottomNav from "@/components/AppBottomNav";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <Header />
        </div>
      </header>
      <main role="main" className="min-h-[calc(100vh-4rem)] pb-16">
        {children}
      </main>
      <AppBottomNav />
      <PWAInstallPrompt />
    </div>
  );
}
