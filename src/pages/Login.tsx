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
    await login(email, senha);
    navigate('/dashboard');
  };

  return (
    <div className=\"max-w-md mx-auto p-4\">
      <h1 className=\"text-2xl font-bold mb-4\">Login</h1>
      <form onSubmit={handleSubmit} className=\"space-y-4\">
        <input type=\"email\" placeholder=\"Email\" value={email}
          onChange={e => setEmail(e.target.value)}
          className=\"border p-2 w-full rounded\" />
        <input type=\"password\" placeholder=\"Senha\" value={senha}
          onChange={e => setSenha(e.target.value)}
          className=\"border p-2 w-full rounded\" />
        {error && <p className=\"text-red-500\">{error}</p>}
        <button type=\"submit\" className=\"bg-blue-600 text-white py-2 px-4 rounded\">
          Entrar
        </button>
      </form>
    </div>
  );
}
