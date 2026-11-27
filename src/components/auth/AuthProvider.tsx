"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type Customer, customerApi } from "@/lib/customer-api";
import { logger } from "@/lib/logger";
import { isServiceError } from "@/services/errors";

export type AuthStatus = "loading" | "unavailable" | "guest" | "authenticated";

interface AuthValue {
  status: AuthStatus;
  customer: Customer | null;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: (customer: Customer) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children, enabled }: { children: React.ReactNode; enabled: boolean }) {
  const [status, setStatus] = useState<AuthStatus>(enabled ? "loading" : "unavailable");
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    customerApi
      .me()
      .then((me) => {
        if (!live) return;
        setCustomer(me);
        setStatus("authenticated");
      })
      .catch((error: unknown) => {
        if (!live) return;
        const guest = isServiceError(error) && error.code === "UNAUTHORIZED";
        if (!guest) logger.warn("Account service unreachable", { error });
        setStatus(guest ? "guest" : "unavailable");
      });
    return () => {
      live = false;
    };
  }, [enabled]);

  const login = useCallback(async (input: { email: string; password: string }) => {
    const me = await customerApi.login(input);
    setCustomer(me);
    setStatus("authenticated");
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; phone: string; password: string }) => {
      const me = await customerApi.register(input);
      setCustomer(me);
      setStatus("authenticated");
    },
    [],
  );

  const logout = useCallback(async () => {
    await customerApi.logout();
    setCustomer(null);
    setStatus("guest");
  }, []);

  const refresh = useCallback((next: Customer) => setCustomer(next), []);

  const value = useMemo(
    () => ({ status, customer, login, register, logout, refresh }),
    [status, customer, login, register, logout, refresh],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
