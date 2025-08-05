import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Studio from './pages/Studio';
import Tracks from './pages/Tracks';
import ProtectedRoutes from './routes/ProtectedRoutes';
import { AuthProvider } from './hooks/useAuth';
import Header from './components/Header';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoutes />}>
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
