import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  BookDown,
  BookUp,
  Search,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  GraduationCap,
  BookMarked,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/library';

export type NavTab = 
  | 'dashboard'
  | 'books'
  | 'issue'
  | 'return'
  | 'search'
  | 'students'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile
}) => {
  const { user, role, switchRole, logout } = useAuth();

  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
    roles: UserRole[];
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'librarian', 'student'] },
    { id: 'books', label: 'Book Management', icon: BookOpen, roles: ['admin', 'librarian'] },
    { id: 'issue', label: 'Issue Book', icon: BookDown, roles: ['admin', 'librarian'] },
    { id: 'return', label: 'Return Book', icon: BookUp, roles: ['admin', 'librarian'] },
    { id: 'search', label: 'Search Books', icon: Search, roles: ['admin', 'librarian', 'student'] },
    { id: 'students', label: 'Students', icon: Users, roles: ['admin', 'librarian'] },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['admin', 'librarian'] },
    { id: 'settings', label: 'System Settings', icon: Settings, roles: ['admin'] }
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs overflow-hidden">
              <img
                src="/src/assets/images/library_crest_logo_1793624588610.jpg"
                alt="Athena College Crest"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-tight leading-tight">
                Athena College
              </h1>
              <span className="text-[11px] text-slate-400 font-medium">Library System</span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded text-slate-400 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Role Switcher Bar */}
        <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Current Portal</span>
            <span className="text-[11px] font-medium text-blue-400 capitalize flex items-center gap-1">
              {role === 'admin' ? <Shield className="w-3 h-3" /> : role === 'student' ? <GraduationCap className="w-3 h-3" /> : <BookMarked className="w-3 h-3" />}
              {role}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => switchRole('admin')}
              className={`py-1 text-[11px] font-medium rounded transition-colors ${
                role === 'admin' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => switchRole('librarian')}
              className={`py-1 text-[11px] font-medium rounded transition-colors ${
                role === 'librarian' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Librarian
            </button>
            <button
              onClick={() => switchRole('student')}
              className={`py-1 text-[11px] font-medium rounded transition-colors ${
                role === 'student' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Student
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Library User'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || 'user@athena.edu'}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
