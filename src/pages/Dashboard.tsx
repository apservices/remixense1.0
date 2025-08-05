import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { email, logout } = useAuth();

  return (
    <div className=\"p-4 max-w-xl mx-auto\">
      <h1 className=\"text-2xl font-bold mb-2\">Bem-vindo, {email}</h1>
      <Link to=\"/studio\" className=\"text-blue-500 underline\">
        Ir para Studio
      </Link>
      <button
        onClick={logout}
        className=\"block mt-4 bg-red-500 text-white px-4 py-2 rounded\"
      >
        Logout
      </button>
    </div>
  );
}
