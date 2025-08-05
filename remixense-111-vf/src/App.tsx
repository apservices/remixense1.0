import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoutes from './routes/ProtectedRoutes';
import Dashboard from './pages/Dashboard';
import Studio from './pages/Studio';
import Tracks from './pages/Tracks';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/tracks" element={<Tracks />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
