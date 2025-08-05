import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  isPremium: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isPremium: false,
});

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated] = useState(true);
  const [isPremium] = useState(true);

  return React.createElement(
    AuthContext.Provider,
    { value: { isAuthenticated, isPremium } },
    children
  );
};

export const useAuth = () => useContext(AuthContext);
