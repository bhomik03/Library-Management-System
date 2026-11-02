import React from 'react';
import {
  BookOpen,
  CheckCircle,
  BookMarked,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  IndianRupee,
  BookDown,
  BookUp,
  Search,
  Plus
} from 'lucide-react';
import { DashboardStats } from '../../types/library';
import { NavTab } from '../layout/Sidebar';
import { useAuth } from '../../context/AuthContext';

interface DashboardViewProps {
  stats: DashboardStats | null;
  loading: boolean;
  onNavigate: (tab: NavTab) => void;
  onQuickIssue: () => void;
  onQuickReturn: () => void;
  onAddBook: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  loading,
  onNavigate,
  onQuickIssue,
  onQuickReturn,
  onAddBook
}) => {
  const { user, role } = useAuth();

  if (loading || !stats) {
    return (
      <div className="p-6 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-44 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-xl" />
          <div className="h-96 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Books',
      value: stats.totalBooks,
      subtext: 'Catalog volume',
      icon: BookOpen,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Available Books',
      value: stats.availableBooks,
      subtext: `${Math.round((stats.availableBooks / (stats.totalBooks || 1)) * 100)}% on shelf`,
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      label: 'Issued Books',
      value: stats.issuedBooks,
      subtext: 'Active student loans',
      icon: BookMarked,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      label: 'Registered Students',
      value: stats.totalStudents,
      subtext: 'Across all depts',
      icon: Users,
      iconColor: 'text-violet-600',
      bgColor: 'bg-violet-50'
    },
    {
      label: 'Overdue Books',
      value: stats.overdueBooks,
      subtext: stats.overdueBooks > 0 ? 'Requires attention' : 'None overdue',
      icon: AlertTriangle,
      iconColor: stats.overdueBooks > 0 ? 'text-red-600' : 'text-slate-400',
      bgColor: stats.overdueBooks > 0 ? 'bg-red-50' : 'bg-slate-50'
    },
    {
      label: 'Fines Collected',
      value: `₹${stats.totalFineCollected.toFixed(0)}`,
      subtext: `Rate: ₹${stats.fineRate}/day`,
      icon: IndianRupee,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm text-white">
        <img
          src="/src/assets/images/college_library_interior_1793624589421.jpg"
          alt="College Library Interior"
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <span>Athena Central College</span>
              <span aria-hidden="true">·</span>
              <span>Library Resource Center</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white text-balance">
              Welcome, {user?.full_name || 'Academic Scholar'}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Automated catalog management, real-time book borrowing tracking, and student circulation records. Current fine policy is set to ₹{stats.fineRate.toFixed(2)} per overdue day.
            </p>
          </div>

          {/* Quick Shortcuts */}
          {(role === 'admin' || role === 'librarian') && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={onQuickIssue}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors whitespace-nowrap"
              >
                <BookDown className="w-4 h-4 text-blue-600" />
                Issue Book
              </button>
              <button
                onClick={onQuickReturn}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
              >
                <BookUp className="w-4 h-4" />
                Return Book
              </button>
              <button
                onClick={onAddBook}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Add Book
              </button>
            </div>
          )}

          {role === 'student' && (
            <button
              onClick={() => onNavigate('search')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Search className="w-4 h-4 text-blue-600" />
              Search Library Catalog
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-500">{kpi.label}</span>
                <div className={`w-8 h-8 rounded-lg ${kpi.bgColor} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${kpi.iconColor}`} />
                </div>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
                  {kpi.value}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{kpi.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Split: Recent Activities & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Issue & Return Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Recent Circulation Activity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live log of book dispatches and check-in returns</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View Full Log
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats.recentActivities.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No recent circulation activity recorded.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentActivities.map(act => (
                <div
                  key={act.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/60 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        act.type === 'issue'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {act.type === 'issue' ? (
                        <BookDown className="w-4 h-4" />
                      ) : (
                        <BookUp className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {act.book_title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700">{act.student_name}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{act.student_id}</span>
                        <span aria-hidden="true">·</span>
                        <span>{act.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {act.type === 'issue' ? (
                      <div>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                            act.status === 'overdue'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {act.status === 'overdue' ? 'Overdue' : 'Active Loan'}
                        </span>
                        {act.due_date && (
                          <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">
                            Due: {act.due_date}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                          Returned
                        </span>
                        {act.fine_amount && act.fine_amount > 0 ? (
                          <span className="block text-[10px] text-amber-700 font-mono mt-0.5">
                            Fine: ₹{act.fine_amount.toFixed(0)} ({act.fine_status})
                          </span>
                        ) : (
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            No fine
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown & Shelf Distribution */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Catalog by Category</h3>
            <p className="text-xs text-slate-500 mb-4">Availability status by academic department</p>

            <div className="space-y-4">
              {Object.entries(stats.categoryCounts).map(([cat, counts]) => {
                const availPct = Math.round((counts.available / (counts.total || 1)) * 100);
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 truncate max-w-[180px]">{cat}</span>
                      <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                        {counts.available} / {counts.total} avail
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${availPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-blue-900">Circulation Desk Hours</h4>
                <p className="text-xs text-blue-800/80 mt-1 leading-relaxed">
                  Monday to Saturday: 08:30 AM – 08:00 PM. Automated return kiosk open 24/7 on ground floor. Maximum 3 books per student loan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
