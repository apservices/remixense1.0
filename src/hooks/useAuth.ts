import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  isPremium: boolean;
  email: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  error: string | null;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isPremium: false,
  email: null,
  login: async () => {},
  logout: () => {},
  error: null,
});

type AuthProviderProps = { children: ReactNode };

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPremium] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, senha: string) => {
    if (email === 'user@example.com' && senha === 'password123') {
      setIsAuthenticated(true);
      setEmail(email);
      setError(null);
    } else {
      setError('Credenciais inválidas');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setEmail(null);
    setError(null);
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { isAuthenticated, isPremium, email, login, logout, error } },
    children
  );
};

export const useAuth = () => useContext(AuthContext);
