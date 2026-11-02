import React, { useState, useEffect } from 'react';
import { SystemSettings } from '../../types/library';
import {
  Settings,
  Database,
  IndianRupee,
  Clock,
  BookOpen,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  FileCode,
  Copy
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

interface SettingsViewProps {
  onRefreshAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRefreshAll }) => {
  const { showToast } = useToast();

  const [settings, setSettings] = useState<SystemSettings>({
    fine_rate_per_day: 5.0,
    default_loan_duration_days: 14,
    max_books_per_student: 3,
    library_name: 'Athena Central College Library',
    librarian_email: 'library@athena.college.edu'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await api.getSettings();
        setSettings(data);
      } catch (err: any) {
        showToast('Error', err.message || 'Failed to fetch settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.updateSettings(settings);
      setSettings(res.settings);
      showToast('Settings Saved', 'Library circulation rules updated successfully.', 'success');
      onRefreshAll();
    } catch (err: any) {
      showToast('Save Failed', err.message || 'Could not update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDatabase = async () => {
    try {
      setResetting(true);
      const res = await api.resetDatabase();
      showToast('Database Reset', res.message, 'success');
      setShowResetConfirm(false);
      onRefreshAll();
      const updated = await api.getSettings();
      setSettings(updated);
    } catch (err: any) {
      showToast('Reset Failed', err.message || 'Could not reset database', 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto text-xs">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">System Settings & Policies</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure circulation policies, overdue fine parameters, and database administration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circulation Parameters Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-sm">Circulation & Fine Rules</h3>
            </div>
            <span className="text-[11px] text-slate-300 font-mono">Admin Only</span>
          </div>

          <form onSubmit={handleSaveSettings} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Overdue Fine Rate (₹ per day)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ₹
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    required
                    value={settings.fine_rate_per_day}
                    onChange={e =>
                      setSettings({ ...settings, fine_rate_per_day: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Charged automatically for every calendar day past the due date.
                </p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Default Loan Duration (Days)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={settings.default_loan_duration_days}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        default_loan_duration_days: parseInt(e.target.value, 10) || 14
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Default return period assigned during standard book issue.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Maximum Concurrent Loans per Student
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={settings.max_books_per_student}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      max_books_per_student: parseInt(e.target.value, 10) || 3
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Blocks new issues once active loans reach this threshold.
                </p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Circulation Desk Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={settings.librarian_email}
                  onChange={e => setSettings({ ...settings, librarian_email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Printed on student return receipts and circulation slips.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                College / Institution Name
              </label>
              <input
                type="text"
                required
                value={settings.library_name}
                onChange={e => setSettings({ ...settings, library_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>

        {/* Database Management & Demo Accounts Card */}
        <div className="space-y-6">
          {/* Quick Demo Credentials */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Pre-Configured Demo Accounts</h3>
            </div>
            <p className="text-slate-500 text-xs">
              Use the sidebar switcher or test manual login credentials:
            </p>

            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono">
                <span className="font-bold text-slate-800 block">Admin Role</span>
                <span className="text-slate-600">User: admin · Pass: admin123</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono">
                <span className="font-bold text-slate-800 block">Librarian Role</span>
                <span className="text-slate-600">User: librarian · Pass: lib123</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono">
                <span className="font-bold text-slate-800 block">Student Role</span>
                <span className="text-slate-600">User: STU-2024-001 · Pass: student123</span>
              </div>
            </div>
          </div>

          {/* Database Reset Action */}
          <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-red-600" />
              <h3 className="font-bold text-sm text-slate-900">Database Maintenance</h3>
            </div>
            <p className="text-slate-500 text-xs">
              Need to restart demo testing or restore default books, students, and circulation records?
            </p>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Sample Records</span>
            </button>
          </div>
        </div>
      </div>

      {/* MySQL Schema Reference Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">MySQL Database Architecture</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">File: /database/schema.sql</span>
        </div>
        <p className="text-slate-600 leading-relaxed">
          The application comes with complete relational MySQL DDL schemas located at <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700">/database/schema.sql</code> including:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px] text-slate-700">
          <div className="p-2 bg-slate-50 rounded border">users (Auth & RBAC)</div>
          <div className="p-2 bg-slate-50 rounded border">students (Enrolled scholars)</div>
          <div className="p-2 bg-slate-50 rounded border">books (Master catalog)</div>
          <div className="p-2 bg-slate-50 rounded border">book_copies (Barcode units)</div>
          <div className="p-2 bg-slate-50 rounded border">book_issues (Loan ledger)</div>
          <div className="p-2 bg-slate-50 rounded border">book_returns (Check-ins)</div>
          <div className="p-2 bg-slate-50 rounded border">fine_payments (Cash/UPI)</div>
          <div className="p-2 bg-slate-50 rounded border">system_settings (Config)</div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Reset Database?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will reset all books, students, loans, and returns back to the default college demo dataset.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDatabase}
                disabled={resetting}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
              >
                {resetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
