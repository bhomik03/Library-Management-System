import React, { useState, useEffect } from 'react';
import {
  BookIssue,
  BookReturn,
  ReturnReceipt,
  Student,
  Book
} from '../../types/library';
import {
  BookUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  FileText,
  Clock,
  Printer,
  Calendar,
  CreditCard,
  Check
} from 'lucide-react';
import { useToast } from '../common/Toast';
import { api } from '../../services/api';

interface BookReturnViewProps {
  preselectedIssueId?: string | null;
  onClearPreselectedIssue?: () => void;
  onOpenReceipt: (receipt: ReturnReceipt) => void;
  onRefreshDashboard?: () => void;
}

export const BookReturnView: React.FC<BookReturnViewProps> = ({
  preselectedIssueId,
  onClearPreselectedIssue,
  onOpenReceipt,
  onRefreshDashboard
}) => {
  const { showToast } = useToast();

  const [lookupQuery, setLookupQuery] = useState(preselectedIssueId || 'STU-2024-001');
  const [isSearching, setIsSearching] = useState(false);
  const [candidates, setCandidates] = useState<Array<{
    issue: BookIssue;
    student: Student;
    book: Book;
    calculated: {
      overdueDays: number;
      fineRate: number;
      fineAmount: number;
      todayStr: string;
      isOverdue: boolean;
    };
  }>>([]);

  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<number>(0);

  // Return Form State
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [conditionNotes, setConditionNotes] = useState('Returned in good academic condition');
  const [fineStatus, setFineStatus] = useState<'paid' | 'pending' | 'waived'>('paid');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('upi');
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Return History List
  const [returnHistory, setReturnHistory] = useState<BookReturn[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchReturnsHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await api.getReturns();
      setReturnHistory(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchReturnsHistory();
  }, []);

  const handleSearch = async (queryToSearch?: string) => {
    const q = queryToSearch !== undefined ? queryToSearch : lookupQuery;
    if (!q.trim()) return;

    try {
      setIsSearching(true);
      const res = await api.lookupReturn(q.trim());
      setCandidates(res);
      setSelectedCandidateIndex(0);
      if (res.length === 0) {
        showToast('No Active Loan Found', `No unreturned books found matching "${q}".`, 'info');
      }
    } catch (err: any) {
      showToast('Lookup Error', err.message || 'Failed to search active loans', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (preselectedIssueId) {
      setLookupQuery(preselectedIssueId);
      handleSearch(preselectedIssueId);
      if (onClearPreselectedIssue) onClearPreselectedIssue();
    } else {
      handleSearch('STU-2024-001');
    }
  }, [preselectedIssueId]);

  const activeCandidate = candidates[selectedCandidateIndex] || null;

  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCandidate) {
      showToast('No Loan Selected', 'Please select an active book loan to return.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.processReturn({
        issue_id: activeCandidate.issue.issue_id,
        return_date: returnDate,
        condition_notes: conditionNotes,
        fine_status: activeCandidate.calculated.fineAmount > 0 ? fineStatus : 'none',
        payment_method: activeCandidate.calculated.fineAmount > 0 ? paymentMethod : undefined,
        transaction_ref: transactionRef || undefined
      });

      showToast('Return Processed!', `Receipt generated for ${res.receipt.bookTitle}`, 'success');

      // Open printable receipt modal
      onOpenReceipt(res.receipt);

      // Refresh candidate list and return ledger
      await handleSearch(lookupQuery);
      await fetchReturnsHistory();
      if (onRefreshDashboard) onRefreshDashboard();
    } catch (err: any) {
      showToast('Return Failed', err.message || 'Could not complete return', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Circulation Desk: Book Return & Fine</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Scan or search by Student ID, Book ID, or Issue ID to compute overdue fines and issue receipts
        </p>
      </div>

      {/* Fast Search Lookup Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
          Step 1: Search Active Issued Loan
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Student ID (e.g. STU-2024-001), Book ID (e.g. BK-1002), or Issue ID (e.g. ISS-2024-1001)..."
              value={lookupQuery}
              onChange={e => setLookupQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono font-medium"
            />
          </div>
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors shrink-0"
          >
            {isSearching ? 'Searching...' : 'Find Issued Record'}
          </button>
        </div>

        {/* Candidate Selector if student has multiple active loans */}
        {candidates.length > 1 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-2">
              Found multiple active loans for this query. Select which book is being returned:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {candidates.map((c, idx) => (
                <button
                  key={c.issue.issue_id}
                  onClick={() => setSelectedCandidateIndex(idx)}
                  className={`p-3 text-left rounded-xl border text-xs transition-all ${
                    selectedCandidateIndex === idx
                      ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="font-mono text-[10px] text-blue-600 font-semibold block">
                    {c.issue.issue_id} · Due {c.issue.due_date}
                  </span>
                  <p className="font-semibold text-slate-900 truncate mt-0.5">{c.book.title}</p>
                  <p className="text-[11px] text-slate-500">Student: {c.student.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Return Confirmation Card */}
      {activeCandidate && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookUp className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-sm">Step 2: Check-In & Fine Settlement</h3>
            </div>
            <div className="text-[11px] font-mono text-slate-300">
              Issue ID: {activeCandidate.issue.issue_id}
            </div>
          </div>

          <form onSubmit={handleConfirmReturn} className="p-6 space-y-6">
            {/* Student & Book Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Borrower Student
                </span>
                <p className="font-bold text-sm text-slate-900">{activeCandidate.student.name}</p>
                <p className="font-mono text-slate-600">{activeCandidate.student.student_id}</p>
                <p className="text-slate-500">
                  {activeCandidate.student.course} · {activeCandidate.student.department}
                </p>
                <p className="text-slate-500">Phone: {activeCandidate.student.phone}</p>
              </div>

              {/* Book info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Book Information
                </span>
                <p className="font-bold text-sm text-slate-900">{activeCandidate.book.title}</p>
                <p className="font-mono text-slate-600">
                  Code: {activeCandidate.book.book_id} · Barcode: {activeCandidate.issue.copy_barcode || 'Standard Unit'}
                </p>
                <p className="text-slate-500">Author: {activeCandidate.book.author}</p>
                <p className="text-slate-500">
                  Current Shelf: <strong className="font-mono text-slate-700">{activeCandidate.book.shelf_location}</strong>
                </p>
              </div>
            </div>

            {/* Dates & Automated Overdue Calculation */}
            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Overdue Analysis & Fine Calculation
                </h4>
                <span className="text-xs text-slate-500 font-mono">
                  Fine Rate: ₹{activeCandidate.calculated.fineRate.toFixed(2)}/day
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Issue Date</span>
                  <span className="font-mono font-medium text-slate-700 block mt-0.5">
                    {activeCandidate.issue.issue_date}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Scheduled Due Date</span>
                  <span className="font-mono font-bold text-slate-900 block mt-0.5">
                    {activeCandidate.issue.due_date}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Overdue Days</span>
                  <span
                    className={`font-mono font-bold block mt-0.5 ${
                      activeCandidate.calculated.overdueDays > 0 ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {activeCandidate.calculated.overdueDays > 0
                      ? `${activeCandidate.calculated.overdueDays} Days Late`
                      : '0 Days (On Time)'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Calculated Late Fine</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-base mt-0.5">
                    <span
                      className={
                        activeCandidate.calculated.fineAmount > 0 ? 'text-red-600' : 'text-slate-700'
                      }
                    >
                      ₹{activeCandidate.calculated.fineAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fine settlement inputs if fine > 0 */}
              {activeCandidate.calculated.fineAmount > 0 && (
                <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Overdue fine required for return completion</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-amber-950 mb-1">
                        Fine Settlement Action
                      </label>
                      <select
                        value={fineStatus}
                        onChange={e => setFineStatus(e.target.value as any)}
                        className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800 font-medium"
                      >
                        <option value="paid">Collect & Mark Paid</option>
                        <option value="pending">Mark Pending on Student Record</option>
                        <option value="waived">Waive Fine (Admin Approval)</option>
                      </select>
                    </div>

                    {fineStatus === 'paid' && (
                      <>
                        <div>
                          <label className="block text-[11px] font-medium text-amber-950 mb-1">
                            Payment Mode
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value as any)}
                            className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800"
                          >
                            <option value="cash">Cash Counter</option>
                            <option value="upi">UPI / QR Scan</option>
                            <option value="card">Debit / Credit Card</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-amber-950 mb-1">
                            Txn Reference / Receipt
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. UPI-921820 or Cash Slip"
                            value={transactionRef}
                            onChange={e => setTransactionRef(e.target.value)}
                            className="w-full p-2 bg-white border border-amber-300 rounded-lg text-slate-800 font-mono text-xs"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Condition Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Actual Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={e => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Physical Condition Inspection
                </label>
                <input
                  type="text"
                  value={conditionNotes}
                  onChange={e => setConditionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-[11px] text-slate-400">
                * Confirming automatically increments available copies and logs receipt
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Processing Return...' : 'Confirm Return & Print Receipt'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Return History Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Return History & Receipts Log</h3>
            <p className="text-xs text-slate-500">Audit trail of completed returns and collected fines</p>
          </div>
          <button
            onClick={fetchReturnsHistory}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh Ledger
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                <th className="py-3 px-4">Return ID / Issue ID</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Return Date</th>
                <th className="py-3 px-4 text-center">Overdue Days</th>
                <th className="py-3 px-4">Fine Amount</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {returnHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No returns logged yet.
                  </td>
                </tr>
              ) : (
                returnHistory.map(ret => (
                  <tr key={ret.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-semibold text-slate-900 block">
                        {ret.return_id}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 block">
                        {ret.issue_id}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900 block">{ret.student_name}</span>
                      <span className="font-mono text-[11px] text-slate-500 block">
                        {ret.student_id}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-medium text-slate-900 line-clamp-1">{ret.book_title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        Inspector: {ret.received_by}
                      </p>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600">
                      {ret.return_date}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap font-mono">
                      {ret.overdue_days > 0 ? (
                        <span className="text-red-600 font-semibold">{ret.overdue_days} d</span>
                      ) : (
                        <span className="text-slate-400">0 d</span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono">
                      {ret.fine_amount > 0 ? (
                        <div>
                          <span className="font-bold text-slate-900">₹{ret.fine_amount.toFixed(2)}</span>
                          <span
                            className={`block text-[10px] capitalize ${
                              ret.fine_status === 'paid'
                                ? 'text-emerald-700 font-semibold'
                                : ret.fine_status === 'waived'
                                ? 'text-blue-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {ret.fine_status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() =>
                          onOpenReceipt({
                            receiptNumber: ret.return_id,
                            returnId: ret.return_id,
                            issueId: ret.issue_id,
                            studentId: ret.student_id,
                            studentName: ret.student_name || ret.student_id,
                            department: 'Enrolled Department',
                            bookId: ret.book_id,
                            bookTitle: ret.book_title || ret.book_id,
                            issueDate: ret.return_date,
                            dueDate: ret.return_date,
                            returnDate: ret.return_date,
                            overdueDays: ret.overdue_days,
                            fineRate: ret.fine_rate,
                            fineAmount: ret.fine_amount,
                            fineStatus: ret.fine_status,
                            paymentMethod: 'Standard Ledger',
                            transactionRef: 'AUDIT-LOG',
                            receivedBy: ret.received_by,
                            conditionNotes: ret.condition_notes || 'Inspected'
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-400" />
                        Receipt
                      </button>
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
