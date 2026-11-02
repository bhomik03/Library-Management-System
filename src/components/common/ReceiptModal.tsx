import React from 'react';
import { ReturnReceipt } from '../../types/library';
import { Printer, Check, X, Building2 } from 'lucide-react';

interface ReceiptModalProps {
  receipt: ReturnReceipt | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Receipt Header (Screen) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-sm">Official Library Return Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 md:p-8 bg-white print:p-0 print:border-none">
          {/* Header */}
          <div className="text-center pb-6 border-b border-slate-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-700 mb-2 print:border">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Athena Central College Library</h2>
            <p className="text-xs text-slate-500 mt-1">Circulation & Return Desk · Official Acknowledgement</p>
            <div className="mt-3 inline-block px-3 py-1 bg-slate-100 rounded text-xs font-mono font-semibold text-slate-800">
              Receipt No: {receipt.receiptNumber}
            </div>
          </div>

          {/* Details Grid */}
          <div className="py-5 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl print:bg-white print:border">
              <div>
                <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Student Details</span>
                <span className="font-semibold text-slate-900 block text-sm mt-0.5">{receipt.studentName}</span>
                <span className="text-slate-600 block font-mono">{receipt.studentId}</span>
                <span className="text-slate-500 block">{receipt.department}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Issue & Return Dates</span>
                <span className="text-slate-600 block mt-0.5">Issued: <strong className="text-slate-900 font-mono">{receipt.issueDate}</strong></span>
                <span className="text-slate-600 block">Due: <strong className="text-slate-900 font-mono">{receipt.dueDate}</strong></span>
                <span className="text-slate-900 font-medium block">Returned: <strong className="text-emerald-700 font-mono">{receipt.returnDate}</strong></span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4">
              <span className="text-slate-400 block uppercase tracking-wider text-[10px] mb-1">Book Information</span>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{receipt.bookTitle}</h4>
                  <p className="text-slate-500 font-mono mt-0.5">Book Code: {receipt.bookId} · Issue ID: {receipt.issueId}</p>
                </div>
              </div>
              {receipt.conditionNotes && (
                <div className="mt-3 pt-2 border-t border-slate-100 text-slate-600">
                  <span className="text-slate-400">Condition Note:</span> {receipt.conditionNotes}
                </div>
              )}
            </div>

            {/* Overdue & Fine Computation */}
            <div className="border border-slate-200 rounded-xl p-4">
              <span className="text-slate-400 block uppercase tracking-wider text-[10px] mb-2">Overdue & Fine Calculation</span>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Overdue Duration</span>
                  <span className="font-mono font-medium text-slate-900">
                    {receipt.overdueDays > 0 ? `${receipt.overdueDays} days late` : 'Returned on schedule (0 days)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Fine Rate</span>
                  <span className="font-mono text-slate-900">₹{receipt.fineRate.toFixed(2)} / day</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-semibold text-sm">
                  <span className="text-slate-900">Total Fine Due</span>
                  <span className="font-mono text-slate-900">₹{receipt.fineAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-600">Fine Payment Status</span>
                  <span className={`px-2 py-0.5 rounded font-medium capitalize ${
                    receipt.fineStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : receipt.fineStatus === 'waived'
                      ? 'bg-blue-100 text-blue-800'
                      : receipt.fineStatus === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {receipt.fineStatus === 'none' ? 'No Fine Incurred' : receipt.fineStatus}
                  </span>
                </div>
                {receipt.fineAmount > 0 && receipt.fineStatus === 'paid' && (
                  <div className="flex justify-between text-slate-500 text-[11px] pt-1">
                    <span>Method: {receipt.paymentMethod.toUpperCase()}</span>
                    <span className="font-mono">Ref: {receipt.transactionRef}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-end text-slate-500 text-[11px]">
              <div>
                <p>Processed by: <strong className="text-slate-700">{receipt.receivedBy}</strong></p>
                <p>System Generated on: {receipt.returnDate}</p>
              </div>
              <div className="text-right border-t border-slate-300 pt-1 w-36">
                <p className="font-serif italic text-slate-600">Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions (Screen) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
