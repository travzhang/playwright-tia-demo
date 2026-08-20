import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { DEMO_EMAIL, DEMO_PASSWORD, readJson, writeJson } from "./lib";

const KEY = "demo.auth";

type AuthContextValue = {
  user: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(() => {
    const stored = readJson<unknown>(KEY, null);
    return typeof stored === "string" ? stored : null;
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: (email, password) => {
        if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) return false;
        setUser(email);
        writeJson(KEY, email);
        return true;
      },
      logout: () => {
        setUser(null);
        localStorage.removeItem(KEY);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
