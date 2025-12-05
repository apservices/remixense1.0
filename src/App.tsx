import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import { AuthProvider } from './hooks/useAuth';
import { PlayerProvider, usePlayer } from './contexts/PlayerContext';
import { GlobalStreamingPlayer } from './components/player/GlobalStreamingPlayer';
import ProtectedRoutes from './routes/ProtectedRoutes';
import LoadingSpinner from './components/LoadingSpinner';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Studio = lazy(() => import('./pages/Studio'));
const StemsStudio = lazy(() => import('./pages/StemsStudio'));
const AutoDJ = lazy(() => import('./pages/AutoDJ'));
const AIStudio = lazy(() => import('./pages/AIStudio'));
const SocialFeed = lazy(() => import('./pages/SocialFeed'));
const MarketplaceStore = lazy(() => import('./pages/MarketplaceStore'));
const Profile = lazy(() => import('./pages/Profile'));
const Vault = lazy(() => import('./pages/Vault'));
const Tracks = lazy(() => import('./pages/Tracks'));
const Trends = lazy(() => import('./pages/Trends'));
const Pricing = lazy(() => import('./pages/Pricing'));
const LaunchCalendar = lazy(() => import('./pages/LaunchCalendar'));
const LandingPageGenerator = lazy(() => import('./pages/LandingPageGenerator'));
const FeedbackRooms = lazy(() => import('./pages/FeedbackRooms'));
const RevenueAnalytics = lazy(() => import('./pages/RevenueAnalytics'));
const Explorer = lazy(() => import('./pages/Explorer'));
const Sessions = lazy(() => import('./pages/Sessions'));
const MetadataManager = lazy(() => import('./pages/MetadataManager'));
const AudioDashboard = lazy(() => import('./pages/AudioDashboard'));
const Inspiration = lazy(() => import('./pages/Inspiration'));
const Settings = lazy(() => import('./pages/Settings'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

const rrFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
  v7_fetcherPersist: true,
  v7_normalizeFormMethod: true,
} as const;

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <ProtectedRoutes />,
    children: [
      { 
        path: '/', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Home />
          </Suspense>
        ) 
      },
      { 
        path: '/dashboard', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        ) 
      },
      { 
        path: '/studio', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Studio />
          </Suspense>
        ) 
      },
      { 
        path: '/studio/stems', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <StemsStudio />
          </Suspense>
        ) 
      },
      { 
        path: '/dj/auto', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AutoDJ />
          </Suspense>
        ) 
      },
      { 
        path: '/ai-studio', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AIStudio />
          </Suspense>
        ) 
      },
      { 
        path: '/feed', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SocialFeed />
          </Suspense>
        ) 
      },
      { 
        path: '/marketplace', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MarketplaceStore />
          </Suspense>
        ) 
      },
      { 
        path: '/profile', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Profile />
          </Suspense>
        ) 
      },
      { 
        path: '/vault', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Vault />
          </Suspense>
        ) 
      },
      { 
        path: '/tracks', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Tracks />
          </Suspense>
        ) 
      },
      { 
        path: '/explorer', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Explorer />
          </Suspense>
        ) 
      },
      { 
        path: '/sessions', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Sessions />
          </Suspense>
        ) 
      },
      { 
        path: '/metadata', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MetadataManager />
          </Suspense>
        ) 
      },
      { 
        path: '/analytics', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AudioDashboard />
          </Suspense>
        ) 
      },
      { 
        path: '/inspiration', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Inspiration />
          </Suspense>
        ) 
      },
      { 
        path: '/trends', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Trends />
          </Suspense>
        ) 
      },
      { 
        path: '/pricing', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Pricing />
          </Suspense>
        ) 
      },
      { 
        path: '/calendar', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LaunchCalendar />
          </Suspense>
        ) 
      },
      { 
        path: '/tools/landing-page', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LandingPageGenerator />
          </Suspense>
        ) 
      },
      { 
        path: '/feedback', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <FeedbackRooms />
          </Suspense>
        ) 
      },
      { 
        path: '/revenue', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <RevenueAnalytics />
          </Suspense>
        ) 
      },
      { 
        path: '/settings', 
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Settings />
          </Suspense>
        ) 
      },
      { path: '*', element: <NotFound /> },
    ],
  },
], { future: rrFuture as any });

function PlayerWrapper() {
  const { currentTrack, playlist, onTrackChange } = usePlayer();
  
  return (
    <>
      <RouterProvider 
        router={router} 
        future={rrFuture as any}
      />
      <GlobalStreamingPlayer 
        currentTrack={currentTrack}
        playlist={playlist}
        onTrackChange={onTrackChange}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PlayerProvider>
          <PlayerWrapper />
        </PlayerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

