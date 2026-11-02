import React, { useState, useEffect } from 'react';
import { BookIssue, Student, Book } from '../../types/library';
import {
  BookOpen,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  MapPin,
  IndianRupee,
  History
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

interface StudentPortalViewProps {
  onSearchCatalog: () => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({ onSearchCatalog }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const studentId = user?.student_id || 'STU-2024-001';
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<{
    student: Student;
    activeIssues: BookIssue[];
    returnedIssues: BookIssue[];
    totalBorrowed: number;
    finePaidTotal: number;
  } | null>(null);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentHistory(studentId);
      setHistory(data);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to fetch personal account', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  if (loading || !history) {
    return (
      <div className="p-6 md:p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-40 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const { student, activeIssues, returnedIssues, totalBorrowed, finePaidTotal } = history;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto text-xs">
      {/* Student Welcome Profile Banner */}
      <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-blue-900 to-slate-900 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider block">
            Student Circulation Account
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            {student.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Student ID: {student.student_id} · {student.course} ({student.semester})
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{student.department}</p>
        </div>

        <button
          onClick={onSearchCatalog}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-sm transition-colors shrink-0"
        >
          <Search className="w-4 h-4 text-blue-600" />
          <span>Browse College Library Catalog</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 block uppercase text-[10px]">Active Books Loaned</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {activeIssues.length}
            </span>
            <span className="text-slate-400 text-xs">/ {student.max_borrow_limit} allowed</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 block uppercase text-[10px]">Overdue Items</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-bold font-mono ${
                activeIssues.some(i => i.status === 'overdue') ? 'text-red-600' : 'text-slate-900'
              }`}
            >
              {activeIssues.filter(i => i.status === 'overdue').length}
            </span>
            <span className="text-slate-400 text-xs">pending return</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 block uppercase text-[10px]">Lifetime Loans</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900">{totalBorrowed}</span>
            <span className="text-slate-400 text-xs">books read</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 block uppercase text-[10px]">Total Fines Cleared</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900">
              ₹{finePaidTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Currently Issued Books */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Your Active Borrowed Books</h3>
            <p className="text-xs text-slate-500">
              Please return or renew before the scheduled due date to avoid overdue fines (₹5/day)
            </p>
          </div>
          <span className="font-mono text-xs text-blue-600 font-semibold">
            {activeIssues.length} Books in Possession
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {activeIssues.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              You currently do not have any borrowed books. Visit the catalog to search and check out titles.
            </div>
          ) : (
            activeIssues.map(iss => {
              const isOverdue = iss.status === 'overdue';
              return (
                <div
                  key={iss.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-blue-600 font-semibold">
                      Issue ID: {iss.issue_id} · Unit Barcode: {iss.copy_barcode || iss.book_id}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{iss.book_title}</h4>
                    <p className="text-slate-500 text-xs">
                      Author: {iss.book_author} · Issued on {iss.issue_date}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isOverdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {isOverdue ? 'Overdue - Return Immediately' : 'Active Loan'}
                    </span>
                    <span className="text-xs font-mono font-medium text-slate-700">
                      Due Date: <strong className={isOverdue ? 'text-red-600 font-bold' : 'text-slate-900'}>{iss.due_date}</strong>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Return History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-900">Past Returned Materials Transcript</h3>
          <p className="text-xs text-slate-500">Historical archive of previously returned library titles</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">Issue ID</th>
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Returned On</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {returnedIssues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No past returns recorded.
                  </td>
                </tr>
              ) : (
                returnedIssues.map(ret => (
                  <tr key={ret.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{ret.issue_id}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{ret.book_title}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{ret.issue_date}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{ret.return_date || 'Returned'}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800">
                        Returned
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
