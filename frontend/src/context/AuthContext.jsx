import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const parseErrorMessage = (err, fallbackMsg) => {
  if (!err) return fallbackMsg;
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const item = detail[0];
    if (typeof item === 'string') return item;
    if (item?.msg) return item.msg;
  }
  if (typeof detail === 'object' && detail !== null) {
    if (detail.msg) return detail.msg;
  }
  return err.message || fallbackMsg;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('potholeguard_token') || null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
        } catch (err) {
          console.error("Failed to restore auth session:", err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await authAPI.signin({ email, password });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('potholeguard_token', access_token);
      setToken(access_token);
      setUser(userData);
      showToast(`Welcome back, ${userData.full_name}!`, 'success');
      return userData;
    } catch (err) {
      const msg = parseErrorMessage(err, 'Sign in failed. Check credentials.');
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const signup = async (userData) => {
    try {
      const res = await authAPI.signup(userData);
      const { access_token, user: newUser } = res.data;
      localStorage.setItem('potholeguard_token', access_token);
      setToken(access_token);
      setUser(newUser);
      showToast(`Account created successfully! Welcome ${newUser.full_name}.`, 'success');
      return newUser;
    } catch (err) {
      const msg = parseErrorMessage(err, 'Sign up failed. Please try again.');
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('potholeguard_token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, toast, showToast }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
