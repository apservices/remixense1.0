import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { isAuthenticated, email, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <header className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
      <div className="flex gap-4">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/studio">Studio</Link>
        <Link to="/tracks">Histórico</Link>
      </div>
      <div className="flex gap-4 items-center">
        <span className="text-sm">{email}</span>
        <button onClick={logout} className="bg-red-600 px-3 py-1 rounded">Logout</button>
      </div>
    </header>
  );
}
