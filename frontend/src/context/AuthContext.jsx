import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const getUserFromStorage = () => {
  const data = localStorage.getItem('mm_user');
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    if (parsed.expiry && new Date(parsed.expiry) > new Date()) {
      return parsed.user;
    } else {
      localStorage.removeItem('mm_user');
      return null;
    }
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUserFromStorage());

  useEffect(() => {
    if (user) {
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 12); // 12 hour session
      localStorage.setItem('mm_user', JSON.stringify({ user, expiry }));
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mm_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 