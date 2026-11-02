import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/library';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (username: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const defaultAdminUser: User = {
  id: 1,
  username: 'admin',
  full_name: 'Dr. Arvind Sharma',
  role: 'admin',
  email: 'admin@athena.college.edu',
  phone: '+91 98765 43210'
};

const defaultLibrarianUser: User = {
  id: 2,
  username: 'librarian',
  full_name: 'Ms. Sunita Roy',
  role: 'librarian',
  email: 'librarian@athena.college.edu',
  phone: '+91 98765 12345'
};

const defaultStudentUser: User = {
  id: 3,
  username: 'STU-2024-001',
  full_name: 'Aarav Patel',
  role: 'student',
  email: 'aarav.p@student.athena.edu',
  phone: '+91 91234 56789',
  student_id: 'STU-2024-001'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('athena_library_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultAdminUser;
      }
    }
    return defaultAdminUser;
  });

  const role: UserRole = user?.role || 'admin';

  useEffect(() => {
    if (user) {
      localStorage.setItem('athena_library_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('athena_library_user');
    }
  }, [user]);

  const login = async (username: string, _customRole?: UserRole) => {
    if (username === 'admin') {
      setUser(defaultAdminUser);
    } else if (username === 'librarian') {
      setUser(defaultLibrarianUser);
    } else if (username.startsWith('STU') || username === 'student') {
      setUser(defaultStudentUser);
    } else {
      // Attempt backend auth
      try {
        const res = await api.login(username, 'password123');
        if (res.user) {
          setUser(res.user);
        }
      } catch (err) {
        // Fallback for demo
        setUser({
          id: Date.now(),
          username,
          full_name: username,
          role: 'librarian',
          email: `${username}@athena.college.edu`
        });
      }
    }
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'admin') setUser(defaultAdminUser);
    else if (newRole === 'librarian') setUser(defaultLibrarianUser);
    else if (newRole === 'student') setUser(defaultStudentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
