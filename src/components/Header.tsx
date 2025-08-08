import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { isAuthenticated, email, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <header className="bg-background text-foreground border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
        <nav className="flex flex-wrap gap-4 text-sm">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/vault">Vault</Link>
          <Link to="/explorer">Explorer</Link>
          <Link to="/ai-studio">AI Studio</Link>
          <Link to="/calendar">Calendar</Link>
          <Link to="/feedback">Feedback</Link>
          <Link to="/metadata">Metadata</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/pricing">Pricing</Link>
        </nav>
        <div className="flex gap-3 items-center">
          <span className="text-xs md:text-sm">{email}</span>
          <button 
            onClick={logout} 
            className="px-3 py-1 rounded border border-border hover:bg-muted transition-smooth"
            aria-label="Sair da conta"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
