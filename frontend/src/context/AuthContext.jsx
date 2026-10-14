import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('keystone_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('keystone_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then((data) => {
        setUser(data);
        localStorage.setItem('keystone_user', JSON.stringify(data));
      })
      .catch(() => {
        localStorage.removeItem('keystone_token');
        localStorage.removeItem('keystone_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    persistSession(data);
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    persistSession(data);
  };

  const persistSession = (data) => {
    localStorage.setItem('keystone_token', data.token);
    const userInfo = {
      id: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      avatarUrl: data.avatarUrl,
    };
    localStorage.setItem('keystone_user', JSON.stringify(userInfo));
    setUser(userInfo);
  };

  const updateProfile = async (payload) => {
    const data = await authService.updateProfile(payload);
    const userInfo = {
      id: data.id,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      avatarUrl: data.avatarUrl,
      phone: data.phone,
    };
    localStorage.setItem('keystone_user', JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  };

  const logout = () => {
    localStorage.removeItem('keystone_token');
    localStorage.removeItem('keystone_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
