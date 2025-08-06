import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, senha);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-white">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-black">
        <h1 className="text-2xl font-bold mb-6 text-center">Entrar no Remixense</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            className="border p-2 w-full rounded" />
          <input type="password" placeholder="Senha" value={senha}
            onChange={e => setSenha(e.target.value)}
            className="border p-2 w-full rounded" />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
