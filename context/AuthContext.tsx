"use client";

import { createContext, useContext, useState } from "react";

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Pour l’instant on simule un utilisateur connecté
  const [user, setUser] = useState<User | null>({
    id: "1",
    name: "Anthony",
    email: "anthony@mail.com",
    role: "admin",
  });

  const login = () => {
    setUser({
      id: "1",
      name: "Anthony",
      email: "anthony@mail.com",
      role: "admin",
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
