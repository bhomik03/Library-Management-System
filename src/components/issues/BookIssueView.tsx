import React, { useState, useEffect } from 'react';
import {
  Book,
  BookIssue,
  Student
} from '../../types/library';
import {
  BookDown,
  Search,
  UserCheck,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookUp,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../common/Toast';
import { api } from '../../services/api';

interface BookIssueViewProps {
  preselectedBookId?: string | null;
  onClearPreselectedBook?: () => void;
  onInitiateReturn?: (issueId: string) => void;
  onRefreshDashboard?: () => void;
}

export const BookIssueView: React.FC<BookIssueViewProps> = ({
  preselectedBookId,
  onClearPreselectedBook,
  onInitiateReturn,
  onRefreshDashboard
}) => {
  const { showToast } = useToast();

  // Active student eligibility state
  const [studentInput, setStudentInput] = useState('STU-2024-001');
  const [studentEligibility, setStudentEligibility] = useState<{
    student: Student;
    currentActiveLoans: number;
    maxLimit: number;
    canBorrow: boolean;
    activeIssues: BookIssue[];
    hasOverdue: boolean;
    reason: string | null;
  } | null>(null);
  const [checkingStudent, setCheckingStudent] = useState(false);

  // Book selection state
  const [bookInput, setBookInput] = useState(preselectedBookId || 'BK-1003');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedCopyBarcode, setSelectedCopyBarcode] = useState<string>('');
  const [checkingBook, setCheckingBook] = useState(false);

  // Loan parameters
  const [loanDays, setLoanDays] = useState(14);
  const [remarks, setRemarks] = useState('Standard academic issue');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current issues list
  const [issuesList, setIssuesList] = useState<BookIssue[]>([]);
  const [issuesFilter, setIssuesFilter] = useState<'all' | 'issued' | 'overdue'>('issued');
  const [issuesSearch, setIssuesSearch] = useState('');
  const [loadingIssues, setLoadingIssues] = useState(false);

  const fetchIssues = async () => {
    try {
      setLoadingIssues(true);
      const data = await api.getIssues({
        status: issuesFilter === 'all' ? undefined : issuesFilter,
        q: issuesSearch || undefined
      });
      setIssuesList(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [issuesFilter, issuesSearch]);

  // If preselectedBookId is passed, look it up automatically
  useEffect(() => {
    if (preselectedBookId) {
      setBookInput(preselectedBookId);
      lookupBook(preselectedBookId);
      if (onClearPreselectedBook) {
        onClearPreselectedBook();
      }
    }
  }, [preselectedBookId]);

  // Initial student lookup
  useEffect(() => {
    lookupStudent('STU-2024-001');
    lookupBook(bookInput);
  }, []);

  const lookupStudent = async (idToSearch?: string) => {
    const id = idToSearch || studentInput;
    if (!id.trim()) return;

    try {
      setCheckingStudent(true);
      const res = await api.checkEligibility(id.trim());
      setStudentEligibility(res);
    } catch (err: any) {
      setStudentEligibility(null);
      showToast('Student Not Found', err.message || `No student found with ID ${id}`, 'error');
    } finally {
      setCheckingStudent(false);
    }
  };

  const lookupBook = async (idToSearch?: string) => {
    const id = idToSearch || bookInput;
    if (!id.trim()) return;

    try {
      setCheckingBook(true);
      const book = await api.getBookById(id.trim());
      setSelectedBook(book);
      // Select first available copy barcode if available
      const firstAvail = book.copies?.find(c => c.status === 'available');
      if (firstAvail) {
        setSelectedCopyBarcode(firstAvail.barcode);
      } else {
        setSelectedCopyBarcode('');
      }
    } catch (err: any) {
      setSelectedBook(null);
      setSelectedCopyBarcode('');
      showToast('Book Not Found', err.message || `No book found with ID ${id}`, 'error');
    } finally {
      setCheckingBook(false);
    }
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentEligibility) {
      showToast('Student Required', 'Please verify a valid registered student first.', 'error');
      return;
    }

    if (!studentEligibility.canBorrow) {
      showToast('Issue Denied', studentEligibility.reason || 'Student cannot borrow books.', 'error');
      return;
    }

    if (!selectedBook) {
      showToast('Book Required', 'Please select a valid library book.', 'error');
      return;
    }

    if (selectedBook.available_quantity <= 0) {
      showToast('Out of Stock', 'This book has 0 available copies.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.issueBook({
        student_id: studentEligibility.student.student_id,
        book_id: selectedBook.book_id,
        copy_barcode: selectedCopyBarcode || undefined,
        loan_days: loanDays,
        remarks: remarks || undefined
      });

      showToast('Book Issued Successfully!', `Issue ID: ${res.issue.issue_id}. Due date: ${res.issue.due_date}`, 'success');

      // Refresh student status, book status, and issues table
      await lookupStudent(studentEligibility.student.student_id);
      await lookupBook(selectedBook.book_id);
      await fetchIssues();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err: any) {
      showToast('Issue Failed', err.message || 'Could not complete book issue.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate dates preview
  const today = new Date();
  const dueDatePreview = new Date(today);
  dueDatePreview.setDate(dueDatePreview.getDate() + Number(loanDays));
  const todayStr = today.toISOString().split('T')[0];
  const dueDateStr = dueDatePreview.toISOString().split('T')[0];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Circulation Desk: Book Issue</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select student ID, assign available physical copy, and generate loan authorization
        </p>
      </div>

      {/* Main Issue Form Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookDown className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-sm">New Loan Issue Authorization</h3>
          </div>
          <div className="text-[11px] text-slate-300 font-mono">
            Standard Period: {loanDays} Days
          </div>
        </div>

        <form onSubmit={handleIssueBook} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step 1: Student Lookup */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Step 1: Student Authorization
                </label>
                <span className="text-[11px] text-slate-400">e.g. STU-2024-001</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Student ID (e.g. STU-2024-001)"
                  value={studentInput}
                  onChange={e => setStudentInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-medium"
                />
                <button
                  type="button"
                  onClick={() => lookupStudent()}
                  disabled={checkingStudent}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors shrink-0"
                >
                  {checkingStudent ? 'Verifying...' : 'Verify'}
                </button>
              </div>

              {/* Student Verified Profile Card */}
              {studentEligibility && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
                    studentEligibility.canBorrow
                      ? 'bg-blue-50/40 border-blue-200'
                      : 'bg-red-50/40 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {studentEligibility.student.name}
                      </h4>
                      <p className="text-slate-500 font-mono text-[11px]">
                        ID: {studentEligibility.student.student_id} · {studentEligibility.student.department}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        {studentEligibility.student.course} ({studentEligibility.student.semester})
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold ${
                          studentEligibility.canBorrow
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {studentEligibility.canBorrow ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Eligible to Borrow
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            Borrow Blocked
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">
                      Active Loans:{' '}
                      <strong className="text-slate-900 font-mono">
                        {studentEligibility.currentActiveLoans} / {studentEligibility.maxLimit} max
                      </strong>
                    </span>
                    {studentEligibility.hasOverdue && (
                      <span className="text-red-600 font-semibold">
                        Overdue books pending return!
                      </span>
                    )}
                  </div>

                  {studentEligibility.reason && (
                    <p className="text-xs text-red-700 bg-red-100/60 p-2 rounded">
                      {studentEligibility.reason}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Book Selection & Copy Barcode */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Step 2: Select Book & Physical Copy
                </label>
                <span className="text-[11px] text-slate-400">e.g. BK-1003</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Book ID (e.g. BK-1003)"
                  value={bookInput}
                  onChange={e => setBookInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-medium"
                />
                <button
                  type="button"
                  onClick={() => lookupBook()}
                  disabled={checkingBook}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors shrink-0"
                >
                  {checkingBook ? 'Checking...' : 'Check Book'}
                </button>
              </div>

              {/* Book Details Card */}
              {selectedBook && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    selectedBook.available_quantity > 0
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-red-50/40 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-blue-600 text-[11px] font-semibold">
                        {selectedBook.book_id} · ISBN {selectedBook.isbn}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                        {selectedBook.title}
                      </h4>
                      <p className="text-slate-600 text-[11px]">
                        Author: {selectedBook.author} · Shelf: <strong className="text-slate-800 font-mono">{selectedBook.shelf_location}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-mono font-bold text-xs ${
                          selectedBook.available_quantity > 0 ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {selectedBook.available_quantity} / {selectedBook.total_quantity} copies
                      </span>
                      <span className="block text-[10px] text-slate-400">available</span>
                    </div>
                  </div>

                  {/* Select physical copy barcode */}
                  {selectedBook.available_quantity > 0 && selectedBook.copies && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Select Specific Physical Copy Barcode:
                      </label>
                      <select
                        value={selectedCopyBarcode}
                        onChange={e => setSelectedCopyBarcode(e.target.value)}
                        className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-300 rounded font-mono"
                      >
                        {selectedBook.copies
                          .filter(c => c.status === 'available')
                          .map(c => (
                            <option key={c.id} value={c.barcode}>
                              {c.barcode} (Copy #{c.copy_number} · Condition: {c.condition_state})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Dates & Remarks Confirmation */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block uppercase text-[10px] mb-1">Issue Date (Today)</span>
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium text-slate-800">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{todayStr}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block uppercase text-[10px] mb-1">Loan Duration</span>
              <div className="flex items-center gap-2">
                <select
                  value={loanDays}
                  onChange={e => setLoanDays(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value={7}>7 Days (1 Week)</option>
                  <option value={14}>14 Days (Standard 2 Weeks)</option>
                  <option value={21}>21 Days (3 Weeks)</option>
                  <option value={30}>30 Days (Semester Special)</option>
                </select>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block uppercase text-[10px] mb-1">Calculated Due Date</span>
              <div className="flex items-center gap-2 p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg font-mono font-bold text-blue-900">
                <Clock className="w-4 h-4 text-blue-700 shrink-0" />
                <span>{dueDateStr}</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Issue Remarks / Course Reference (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="e.g. Midterm prep, Algorithm coursework project"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              * Database transaction enforces stock decrement and copy lock
            </span>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !studentEligibility?.canBorrow ||
                !selectedBook ||
                selectedBook.available_quantity <= 0
              }
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors disabled:opacity-40"
            >
              <BookDown className="w-4 h-4" />
              <span>{isSubmitting ? 'Issuing Book...' : 'Confirm Book Loan'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Currently Issued Books Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Active Book Issues Ledger</h3>
            <p className="text-xs text-slate-500">
              Real-time monitoring of all dispatched library materials
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search issue ID, student..."
                value={issuesSearch}
                onChange={e => setIssuesSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg w-48 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-slate-200/60 rounded-lg text-[11px]">
              <button
                onClick={() => setIssuesFilter('issued')}
                className={`px-2.5 py-1 rounded font-medium ${
                  issuesFilter === 'issued' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setIssuesFilter('overdue')}
                className={`px-2.5 py-1 rounded font-medium ${
                  issuesFilter === 'overdue' ? 'bg-white text-red-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Overdue
              </button>
              <button
                onClick={() => setIssuesFilter('all')}
                className={`px-2.5 py-1 rounded font-medium ${
                  issuesFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
            </div>

            <button
              onClick={fetchIssues}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded"
              title="Refresh issues"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingIssues ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">Issue ID & Barcode</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {issuesList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No active loans match this view.
                  </td>
                </tr>
              ) : (
                issuesList.map(item => {
                  const isOverdue = item.status === 'overdue';
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-semibold text-slate-900 block">
                          {item.issue_id}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 block">
                          {item.copy_barcode || item.book_id}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">
                          {item.student_name}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 block">
                          {item.student_id}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-medium text-slate-900 line-clamp-1">{item.book_title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          Shelf: {item.shelf_location || 'Central Stacks'}
                        </p>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600">
                        {item.issue_date}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono">
                        <span className={isOverdue ? 'text-red-600 font-bold' : 'text-slate-800 font-medium'}>
                          {item.due_date}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            isOverdue
                              ? 'bg-red-100 text-red-800'
                              : item.status === 'returned'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {item.status !== 'returned' && onInitiateReturn && (
                          <button
                            onClick={() => onInitiateReturn(item.issue_id)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          >
                            <BookUp className="w-3.5 h-3.5" />
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
