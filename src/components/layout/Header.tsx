import React from 'react';
import { Menu, Plus, RefreshCw, BookDown, Search } from 'lucide-react';
import { NavTab } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobile: () => void;
  onQuickIssue: () => void;
  onQuickSearch: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Library Dashboard', subtitle: 'Real-time circulation metrics & activities' },
  books: { title: 'Book Management', subtitle: 'Catalog, physical copy inventory, and racks' },
  issue: { title: 'Issue Book Desk', subtitle: 'Student authorization & book loan dispatch' },
  return: { title: 'Return & Fine Desk', subtitle: 'Check-in, overdue fine computation, and receipt' },
  search: { title: 'Online Book Search', subtitle: 'Search title, author, ISBN, category, and shelf' },
  students: { title: 'Student Directory', subtitle: 'Enrolled students, borrowing records, and limits' },
  reports: { title: 'Reports & Analytics', subtitle: 'Circulation ledgers, overdue logs, and audit data' },
  settings: { title: 'System Settings', subtitle: 'Circulation policies, fine rate, and parameters' }
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobile,
  onQuickIssue,
  onQuickSearch,
  onRefreshData,
  isRefreshing = false
}) => {
  const { role } = useAuth();
  const current = tabTitles[currentTab] || { title: 'Library System', subtitle: '' };

  const todayStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="h-16 px-4 md:px-8 bg-white border-b border-slate-200 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
      {/* Zone 1: Mobile toggle & Breadcrumb Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Athena LMS</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-800 font-semibold truncate">{current.title}</span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block truncate mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Zone 2: Academic Date */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
        <span className="font-medium text-slate-700">{todayStr}</span>
        <span aria-hidden="true">·</span>
        <span className="text-slate-500">Session 2024-2025</span>
      </div>

      {/* Zone 3: Primary Action Shortcuts */}
      <div className="flex items-center gap-2 shrink-0">
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            title="Refresh database records"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        )}

        <button
          onClick={onQuickSearch}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span>Search</span>
        </button>

        {(role === 'admin' || role === 'librarian') && (
          <button
            onClick={onQuickIssue}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <BookDown className="w-3.5 h-3.5" />
            <span>Issue Book</span>
          </button>
        )}
      </div>
    </header>
  );
};
