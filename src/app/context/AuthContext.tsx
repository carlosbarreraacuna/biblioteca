'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { setAuthToken } from '@/lib/axios'; // Asegúrate de que esta ruta sea correcta
import { User } from '@/app/types/user';

type AuthContextType = {
  token: string | null;
  setToken: (token: string | null) => void;
  isHydrated: boolean; // ⬅️ clave para saber cuándo está listo
  user: User | null,
  setUser: (user: User | null) => void,
  logout: () => void, // <-- Agregamos logout
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => { },
  isHydrated: false,
  user: null,
  setUser: () => { },
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    setAuthToken(newToken);
    if (typeof window !== 'undefined') {
      if (newToken) {
        localStorage.setItem('token', newToken);
        // Fetch user info inmediatamente tras login
        fetch('http://localhost:8000/api/usuariosrol', {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            setUser(data);
          })
          .catch(() => {
            setUser(null);
          });
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setTokenState(storedToken);
        setAuthToken(storedToken);

        // 🔁 Cargar datos del usuario
        fetch('http://localhost:8000/api/usuariosrol', {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            setUser(data); // 👈 asegura que venga el campo 'role'
          })
          .catch(() => {
            setUser(null);
          });
      }
      setIsHydrated(true);
    }
  }, []);


  // No renderizar nada hasta que esté hidratado (opcional: un loader)
  if (!isHydrated) {
    return null; // o un spinner si querés
  }

  return (
    <AuthContext.Provider value={{ token, setToken, isHydrated, user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
