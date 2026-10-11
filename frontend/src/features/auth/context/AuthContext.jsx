import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../../config/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('ai_wardrobe_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUser = (sess, manualUser = null) => {
    setSession(sess);
    const activeUser = sess?.user ?? manualUser ?? null;
    setUser(activeUser);
    if (activeUser) {
      try {
        localStorage.setItem('ai_wardrobe_user', JSON.stringify(activeUser));
      } catch (e) {
        console.warn('Failed to cache user in localStorage', e);
      }
    } else {
      localStorage.removeItem('ai_wardrobe_user');
    }
  };

  useEffect(() => {
    // 1. Get initial session on app mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUser(session);
      setLoading(false);
    }).catch(err => {
      console.warn('Error fetching initial Supabase session:', err);
      setLoading(false);
    });

    // 2. Listen to auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session);
      setLoading(false);
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  const signUp = async (email, password, metadata = {}) => {
    try {
      // 1. Register through pre-confirmed backend endpoint so no email verification email is needed
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName: metadata.full_name || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Automatically sign in the user right away
      return await signIn(email, password);
    } catch (apiErr) {
      console.warn('Backend register failed, trying direct Supabase:', apiErr.message);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (error) throw error;
      if (data.session) {
        syncUser(data.session, data.user);
      } else if (data.user) {
        syncUser(null, data.user);
      }
      return data;
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      syncUser(data.session, data.user);
      return data;
    } catch (err) {
      // If direct Supabase signIn threw an error, attempt backend fallback login
      console.warn('Client signInWithPassword failed, attempting backend fallback:', err.message);
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const backData = await res.json();
      if (!res.ok) {
        throw new Error(backData.message || err.message || 'Invalid login credentials');
      }

      if (backData.session) {
        try {
          await supabase.auth.setSession(backData.session);
        } catch (setErr) {
          console.warn('setSession warning:', setErr);
        }
        syncUser(backData.session, backData.user);
      } else if (backData.user) {
        syncUser(null, backData.user);
      }
      return backData;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      syncUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
