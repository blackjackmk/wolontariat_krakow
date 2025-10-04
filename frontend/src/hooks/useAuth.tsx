import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import api from "../api/axios";
import { findUserByUsername } from "@/api/users";

interface AuthContextType {
  user: Uzytkownik | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<Uzytkownik | null>(null);

  const login = async (username: string, password: string) => {
    // TODO: replace with real auth and profile fetch
    const mock = await findUserByUsername(username);
    setUser(
      mock ||
        ({
          id: -1,
          username,
          email: 'user@example.com',
          haslo: '',
          nr_telefonu: '',
          rola: 'wolontariusz',
        } as Uzytkownik)
    );
    // todo link api
    // const res = await api.post("token/", { username, password });
    // localStorage.setItem("access", res.data.access);
    // localStorage.setItem("refresh", res.data.refresh);

    // const profile = await api.get("profile/");
    // setUser(profile.data);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  useEffect(() => {
    // todo link api
    // const fetchProfile = async () => {
    //   const token = localStorage.getItem("access");
    //   if (token) {
    //     try {
    //       const profile = await api.get("profile/");
    //       setUser(profile.data);
    //     } catch {
    //       logout();
    //     }
    //   }
    // };
    // fetchProfile();
  }, []);

  // go to dashboard after login
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user]);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
