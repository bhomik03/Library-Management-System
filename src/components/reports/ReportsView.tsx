import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  AlertTriangle,
  IndianRupee,
  TrendingUp,
  RotateCcw,
  BookDown,
  BookUp,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

type ReportTab =
  | 'daily-issues'
  | 'daily-returns'
  | 'overdue'
  | 'fine-collection'
  | 'most-borrowed';

export const ReportsView: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ReportTab>('daily-issues');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await api.getReport(activeTab, selectedDate);
      setReportData(data);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, selectedDate]);

  // CSV Export utility
  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) {
      showToast('No Data', 'Current report contains no rows to export.', 'info');
      return;
    }

    const headers = Object.keys(reportData[0]).filter(k => typeof reportData[0][k] !== 'object');
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of reportData) {
      const values = headers.map(header => {
        const val = row[header];
        const escaped = ('' + (val !== null && val !== undefined ? val : '')).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `athena_library_${activeTab}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Report Exported', `Downloaded ${activeTab} CSV data file.`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Institutional Library Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit ledgers, circulation statistics, fine records, and analytical trends
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 no-print">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Tabs & Date Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Segmented Tab Controls */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('daily-issues')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'daily-issues'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookDown className="w-3.5 h-3.5 text-blue-600" />
              Daily Book Issues
            </button>

            <button
              onClick={() => setActiveTab('daily-returns')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'daily-returns'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookUp className="w-3.5 h-3.5 text-emerald-600" />
              Daily Book Returns
            </button>

            <button
              onClick={() => setActiveTab('overdue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'overdue'
                  ? 'bg-white text-red-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              Overdue Books
            </button>

            <button
              onClick={() => setActiveTab('fine-collection')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'fine-collection'
                  ? 'bg-white text-amber-800 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
              Fine Collections
            </button>

            <button
              onClick={() => setActiveTab('most-borrowed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'most-borrowed'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-violet-600" />
              Most Borrowed
            </button>
          </div>

          {/* Date Picker (for daily issue/return logs) */}
          {(activeTab === 'daily-issues' || activeTab === 'daily-returns') && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Select Ledger Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block text-center pb-4 border-b border-slate-300">
        <h1 className="text-xl font-bold text-slate-900">Athena Central College Library</h1>
        <p className="text-xs text-slate-600">
          Official Institutional Report · Generated on {new Date().toLocaleDateString()}
        </p>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 mt-2">
          {activeTab.replace('-', ' ').toUpperCase()}
        </h2>
      </div>

      {/* Report Table Display */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 capitalize">
              {activeTab.replace('-', ' ')}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500 font-mono">
              Total Records: {reportData.length}
            </span>
          </div>
          {activeTab === 'fine-collection' && (
            <div className="font-mono font-bold text-amber-700">
              Total Fines Collected: ₹
              {reportData.reduce((acc, r) => acc + (Number(r.amount) || 0), 0).toFixed(2)}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Generating report ledger...
            </div>
          ) : reportData.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No entries logged for this report filter criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              {/* Dynamic Columns based on Report Type */}
              {activeTab === 'daily-issues' && (
                <>
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                      <th className="py-3 px-4">Issue ID</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Book Title</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Dispatched By</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.map((row: any) => (
                      <tr key={row.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900">{row.issue_id}</td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900 block">{row.student_name}</span>
                          <span className="font-mono text-[11px] text-slate-400">{row.student_id}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">{row.book_title}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{row.due_date}</td>
                        <td className="py-3 px-4 text-slate-600">{row.issued_by}</td>
                        <td className="py-3 px-4 text-slate-500">{row.remarks || 'Standard Loan'}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {activeTab === 'daily-returns' && (
                <>
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                      <th className="py-3 px-4">Return ID</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Book Title</th>
                      <th className="py-3 px-4 text-center">Overdue Days</th>
                      <th className="py-3 px-4">Fine Amount</th>
                      <th className="py-3 px-4">Condition Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.map((row: any) => (
                      <tr key={row.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900">{row.return_id}</td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900 block">{row.student_name}</span>
                          <span className="font-mono text-[11px] text-slate-400">{row.student_id}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">{row.book_title}</td>
                        <td className="py-3 px-4 text-center font-mono">{row.overdue_days} d</td>
                        <td className="py-3 px-4 font-mono font-semibold">
                          {row.fine_amount > 0 ? `₹${row.fine_amount.toFixed(2)}` : 'None'}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{row.condition_notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {activeTab === 'overdue' && (
                <>
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                      <th className="py-3 px-4">Issue ID</th>
                      <th className="py-3 px-4">Student & Contact</th>
                      <th className="py-3 px-4">Book Title</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4 text-center">Days Overdue</th>
                      <th className="py-3 px-4 font-mono">Estimated Fine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.map((row: any) => (
                      <tr key={row.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900">{row.issue_id}</td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900 block">{row.student_name}</span>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            {row.student_id} · {row.student_phone}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">{row.book_title}</td>
                        <td className="py-3 px-4 font-mono text-red-600 font-medium">{row.due_date}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-red-600">
                          {row.overdue_days} days
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-red-700">
                          ₹{row.estimated_fine.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {activeTab === 'fine-collection' && (
                <>
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                      <th className="py-3 px-4">Receipt No</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Book Reference</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Transaction Ref</th>
                      <th className="py-3 px-4">Paid On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.map((row: any) => (
                      <tr key={row.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900">{row.receipt_no}</td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900 block">{row.student_name}</span>
                          <span className="font-mono text-[11px] text-slate-400">{row.student_id}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">{row.book_title}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          ₹{row.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 uppercase text-[11px] font-medium text-slate-700">
                          {row.payment_method}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                          {row.transaction_ref || 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{row.paid_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {activeTab === 'most-borrowed' && (
                <>
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                      <th className="py-3 px-4">Rank / Book ID</th>
                      <th className="py-3 px-4">Book Title & Author</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-center">Times Borrowed</th>
                      <th className="py-3 px-4">Inventory Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.map((row: any, idx: number) => (
                      <tr key={row.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-slate-100 font-mono font-bold text-[10px] text-slate-700 mr-2">
                            {idx + 1}
                          </span>
                          <span className="font-mono font-semibold text-slate-900">{row.book_id}</span>
                        </td>
                        <td className="py-3 px-4 max-w-sm">
                          <span className="font-semibold text-slate-900 block">{row.title}</span>
                          <span className="text-[11px] text-slate-500">{row.author}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{row.category}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-blue-600 text-sm">
                          {row.times_issued} loans
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {row.available_quantity} / {row.total_quantity} avail
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
