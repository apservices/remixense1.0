import { useState, useEffect } import { useEffect } import { useEffect } from 'react';
import { registerServiceWorker } from '@/pwa/register-sw';
import { registerServiceWorker } from '@/pwa/register-sw';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } import { useEffect } import { useEffect } from 'react';
import { registerServiceWorker } from '@/pwa/register-sw';
import { registerServiceWorker } from '@/pwa/register-sw';
import { BrowserRouter, Routes, Route } import { useEffect } import { useEffect } from 'react';
import { registerServiceWorker } from '@/pwa/register-sw';
import { registerServiceWorker } from '@/pwa/register-sw';
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/AuthGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Onboarding } from "@/components/Onboarding";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import LaunchCalendar from "./pages/LaunchCalendar";
import FeedbackRooms from "./pages/FeedbackRooms";
import LandingPageGenerator from "./pages/LandingPageGenerator";
import AIStudio from "./pages/AIStudio";
import RevenueAnalytics from "./pages/RevenueAnalytics";
import MetadataManager from "./pages/MetadataManager";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed') === 'true';
      setShowOnboarding(!hasCompletedOnboarding);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <Onboarding 
        onComplete={() => {
          localStorage.setItem('onboarding_completed', 'true');
          setShowOnboarding(false);
        }} 
      />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <AuthGuard>
            <Index />
          </AuthGuard>
        } />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/calendar" element={
          <AuthGuard>
            <LaunchCalendar />
          </AuthGuard>
        } />
        <Route path="/feedback" element={
          <AuthGuard>
            <FeedbackRooms />
          </AuthGuard>
        } />
        <Route path="/landing-generator" element={
          <AuthGuard>
            <LandingPageGenerator />
          </AuthGuard>
        } />
        <Route path="/ai-studio" element={
          <AuthGuard>
            <AIStudio />
          </AuthGuard>
        } />
        <Route path="/analytics" element={
          <AuthGuard>
            <RevenueAnalytics />
          </AuthGuard>
        } />
        <Route path="/metadata" element={
          <AuthGuard>
            <MetadataManager />
          </AuthGuard>
        } />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
