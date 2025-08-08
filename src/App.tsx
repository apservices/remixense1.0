import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoutes from './routes/ProtectedRoutes';
import Home from './pages/Home';
import Studio from './pages/Studio';
import Tracks from './pages/Tracks';
import Explorer from './pages/Explorer';
import Vault from './pages/Vault';
import Trends from './pages/Trends';
import Pricing from './pages/Pricing';
import LaunchCalendar from './pages/LaunchCalendar';
import FeedbackRooms from './pages/FeedbackRooms';
import LandingPageGenerator from './pages/LandingPageGenerator';
import AIStudio from './pages/AIStudio';
import RevenueAnalytics from './pages/RevenueAnalytics';
import MetadataManager from './pages/MetadataManager';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

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
      { path: '/', element: <Home /> },
      { path: '/dashboard', element: <Home /> },
      { path: '/explorer', element: <Explorer /> },
      { path: '/vault', element: <Vault /> },
      { path: '/trends', element: <Trends /> },
      { path: '/pricing', element: <Pricing /> },
      { path: '/calendar', element: <LaunchCalendar /> },
      { path: '/feedback', element: <FeedbackRooms /> },
      { path: '/landing-generator', element: <LandingPageGenerator /> },
      { path: '/ai-studio', element: <AIStudio /> },
      { path: '/analytics', element: <RevenueAnalytics /> },
      { path: '/metadata', element: <MetadataManager /> },
      { path: '/marketplace', element: <Marketplace /> },
      { path: '/profile', element: <Profile /> },
      { path: '/studio', element: <Studio /> },
      { path: '/tracks', element: <Tracks /> },
      { path: '*', element: <NotFound /> },
    ],
  },
], { future: rrFuture as any });

function App() {
  return (
    <AuthProvider>
      <RouterProvider 
        router={router} 
        future={rrFuture as any}
      />
    </AuthProvider>
  );
}

export default App;

