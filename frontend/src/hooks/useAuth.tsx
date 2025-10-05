import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentProfile } from "@/api/users";
import { loginApi, logoutApi, registerApi } from "@/api/auth";

interface AuthContextType {
  user: Uzytkownik | null;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: { username: string; email: string; password: string; nr_telefonu: string; rola: RoleType; first_name?: string; last_name?: string; organizacja_id?: number }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<Uzytkownik | null>(null);

  const login = async (username: string, password: string) => {
    const u = await loginApi(username, password);
    setUser(u);
  };

  const logout = () => {
    logoutApi().catch(() => {});
    setUser(null);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const profile = await getCurrentProfile();
          if (profile) setUser(profile);
        } catch {
          logout();
        }
      }
    };
    fetchProfile();
  }, []);

  // go to dashboard after login
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user]);

  const register = async (payload: { username: string; email: string; password: string; nr_telefonu: string; rola: RoleType; first_name?: string; last_name?: string; organizacja_id?: number }) => {
    const u = await registerApi(payload);
    setUser(u);
  };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
