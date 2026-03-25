import { createContext, useContext, useState } from 'react';
import type { User } from '@/types/user';

const mockUser: User = {
  id: '1',
  name: 'Dr. Research',
  email: 'researcher@nitroduck.ai',
  createdAt: '2025-01-01',
};

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: mockUser,
  isAuthenticated: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<User | null>(mockUser);

  const login = () => {
    // stub for future OAuth
    console.log('login stub');
  };

  const logout = () => {
    // stub for future OAuth
    console.log('logout stub');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: true, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
