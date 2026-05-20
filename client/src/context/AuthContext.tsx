"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, AuthState } from "@/types";
import { authService } from "@/services/auth.service";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("gigflow_token");
    const userStr = localStorage.getItem("gigflow_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState({ user, token, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem("gigflow_token");
        localStorage.removeItem("gigflow_user");
        setState((s) => ({ ...s, isLoading: false }));
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await authService.login({ email, password });
    localStorage.setItem("gigflow_token", token);
    localStorage.setItem("gigflow_user", JSON.stringify(user));
    setState({ user, token, isAuthenticated: true, isLoading: false });
  }, []);

  const register = useCallback(async (
    name: string, email: string, password: string, role?: string
  ) => {
    const { user, token } = await authService.register({ name, email, password, role });
    localStorage.setItem("gigflow_token", token);
    localStorage.setItem("gigflow_user", JSON.stringify(user));
    setState({ user, token, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("gigflow_token");
    localStorage.removeItem("gigflow_user");
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};