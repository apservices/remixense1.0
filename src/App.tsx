import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/calendar" element={<LaunchCalendar />} />
            <Route path="/feedback" element={<FeedbackRooms />} />
            <Route path="/landing-generator" element={<LandingPageGenerator />} />
            <Route path="/ai-studio" element={<AIStudio />} />
            <Route path="/analytics" element={<RevenueAnalytics />} />
            <Route path="/metadata" element={<MetadataManager />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/tracks" element={<Tracks />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
