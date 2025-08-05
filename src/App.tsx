import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Studio from './pages/Studio';
import Tracks from './pages/Tracks';
import ProtectedRoutes from './routes/ProtectedRoutes';
import Header from './components/Header';
import { AuthProvider } from './hooks/useAuth';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/tracks" element={<Tracks />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
