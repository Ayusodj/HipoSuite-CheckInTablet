import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from 'react';

export interface User {
  id: string;
  username: string;
  role?: string;
  dept?: string | null;
}

interface AuthContextType {
  currentUser: User | null;
  accessToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
  isLoading: boolean;
  getAuthHeader: () => Record<string,string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_KEY = 'hiposuite_access';
const REFRESH_KEY = 'hiposuite_refresh';
const USER_KEY = 'hiposuite_currentUser';

function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(payload).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshInProgress = useRef<Promise<boolean> | null>(null);

  const saveTokens = (access: string|null, refresh: string|null) => {
    if (access) sessionStorage.setItem(ACCESS_KEY, access); else sessionStorage.removeItem(ACCESS_KEY);
    if (refresh) sessionStorage.setItem(REFRESH_KEY, refresh); else sessionStorage.removeItem(REFRESH_KEY);
    setAccessToken(access);
    if (access) {
      const claims = parseJwt(access);
      if (claims) {
        // Some tokens use is_staff / is_superuser flags rather than a 'role' claim.
        const computedRole = (claims.is_staff || claims.is_superuser) ? 'admin' : claims.role;
        setCurrentUser({ id: claims.sub || '', username: claims.sub || '', role: computedRole, dept: claims.dept });
        sessionStorage.setItem(USER_KEY, JSON.stringify({ id: claims.sub || '', username: claims.sub || '', role: computedRole, dept: claims.dept }));
      }
    } else {
      setCurrentUser(null);
      sessionStorage.removeItem(USER_KEY);
    }
  };

  useEffect(() => {
    // load tokens from sessionStorage
    try {
      const storedAccess = sessionStorage.getItem(ACCESS_KEY);
      const storedRefresh = sessionStorage.getItem(REFRESH_KEY);
      if (storedAccess) {
        const claims = parseJwt(storedAccess);
        if (claims) {
          const exp = claims.exp;
          const now = Math.floor(Date.now()/1000);
          if (exp && exp <= now) {
            // try refresh
            (async () => {
              const ok = await doRefresh(storedRefresh);
              if (!ok) {
                saveTokens(null, null);
              }
              setIsLoading(false);
            })();
            return;
          }
          saveTokens(storedAccess, storedRefresh);
        }
      }
    } catch (e) {
      console.error('Failed to load auth tokens', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const doRefresh = async (refreshToken: string | null): Promise<boolean> => {
    if (!refreshToken) return false;
    // dedupe parallel refresh
    if (refreshInProgress.current) return refreshInProgress.current;
    const p = (async () => {
      try {
        const res = await fetch('/api/auth/refresh/', {
          method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({refresh: refreshToken})
        });
        if (!res.ok) return false;
        const j = await res.json();
        const newAccess = j.token;
        const newRefresh = j.refresh;
        saveTokens(newAccess, newRefresh);
        return true;
      } catch (e) {
        console.error('refresh failed', e);
        return false;
      } finally {
        refreshInProgress.current = null;
      }
    })();
    refreshInProgress.current = p;
    return p;
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login/', {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({username, password})
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`login failed: ${res.status} ${txt}`);
      }
      const j = await res.json();
      saveTokens(j.token, j.refresh);
      // return parsed claims for immediate use (role, sub, etc.) with computed role
      const claims = parseJwt(j.token);
      if (claims) {
        const computedRole = (claims.is_staff || claims.is_superuser) ? 'admin' : claims.role;
        return { ...claims, role: computedRole };
      }
      return claims;
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async (): Promise<boolean> => {
    const storedRefresh = sessionStorage.getItem(REFRESH_KEY);
    if (!storedRefresh) return false;
    return doRefresh(storedRefresh);
  };

  const logout = async (): Promise<void> => {
    const storedRefresh = sessionStorage.getItem(REFRESH_KEY);
    const storedAccess = sessionStorage.getItem(ACCESS_KEY);
    try {
      await fetch('/api/auth/logout/', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({refresh: storedRefresh, access: storedAccess}) });
    } catch (e) {
      // ignore
    }
    saveTokens(null, null);
    window.location.href = '/login';
  };

  const getAuthHeader = () => ({ Authorization: accessToken ? `Bearer ${accessToken}` : '' });

  const value: AuthContextType = { currentUser, accessToken, login, logout, refresh, isLoading, getAuthHeader };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
