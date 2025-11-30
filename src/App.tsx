import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import { AuthProvider } from './hooks/useAuth';
import { PlayerProvider } from './contexts/PlayerContext';
import ProtectedRoutes from './routes/ProtectedRoutes';
import LoadingSpinner from './components/LoadingSpinner';
import NotFound from './pages/NotFound';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const StemsStudio = lazy(() => import('./pages/StemsStudio'));
const AutoDJ = lazy(() => import('./pages/AutoDJ'));
const SocialFeed = lazy(() => import('./pages/SocialFeed'));
const MarketplaceStore = lazy(() => import('./pages/MarketplaceStore'));
const Profile = lazy(() => import('./pages/Profile'));
const Vault = lazy(() => import('./pages/Vault'));
const Trends = lazy(() => import('./pages/Trends'));
const Pricing = lazy(() => import('./pages/Pricing'));

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
      { path: '*', element: <NotFound /> },
    ],
  },
], { future: rrFuture as any });

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <RouterProvider 
          router={router} 
          future={rrFuture as any}
        />
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;

