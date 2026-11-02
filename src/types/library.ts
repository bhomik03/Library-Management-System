export type UserRole = 'admin' | 'librarian' | 'student';

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: UserRole;
  email: string;
  phone?: string;
  student_id?: string;
}

export interface Student {
  id: number;
  student_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  course: string;
  semester: string;
  max_borrow_limit: number;
  created_at: string;
  activeLoansCount?: number;
  overdueCount?: number;
}

export interface BookCopy {
  id: number;
  book_id: string;
  copy_number: number;
  barcode: string;
  status: 'available' | 'issued' | 'maintenance' | 'lost';
  condition_state: 'new' | 'good' | 'fair' | 'damaged';
  shelf_location: string;
}

export interface Book {
  id: number;
  book_id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  category: string;
  publication_year: number;
  total_quantity: number;
  available_quantity: number;
  shelf_location: string;
  description?: string;
  cover_url?: string;
  created_at: string;
  updated_at: string;
  copies?: BookCopy[];
  activeIssues?: BookIssue[];
}

export interface BookIssue {
  id: number;
  issue_id: string;
  student_id: string;
  student_name?: string;
  student_dept?: string;
  book_id: string;
  book_title?: string;
  book_author?: string;
  copy_id?: number;
  copy_barcode?: string;
  issue_date: string;
  due_date: string;
  return_date?: string | null;
  status: 'issued' | 'returned' | 'overdue';
  issued_by: string;
  shelf_location?: string;
  remarks?: string;
  created_at: string;
}

export interface BookReturn {
  id: number;
  return_id: string;
  issue_id: string;
  student_id: string;
  student_name?: string;
  book_id: string;
  book_title?: string;
  return_date: string;
  overdue_days: number;
  fine_rate: number;
  fine_amount: number;
  fine_status: 'none' | 'paid' | 'pending' | 'waived';
  received_by: string;
  condition_notes?: string;
  created_at: string;
}

export interface FinePayment {
  id: number;
  receipt_no: string;
  return_id: string;
  student_id: string;
  student_name?: string;
  book_title?: string;
  amount: number;
  payment_method: 'cash' | 'upi' | 'card' | 'waived';
  transaction_ref?: string;
  paid_at: string;
  overdue_days?: number;
}

export interface SystemSettings {
  fine_rate_per_day: number;
  default_loan_duration_days: number;
  max_books_per_student: number;
  library_name: string;
  librarian_email: string;
}

export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  issuedBooks: number;
  totalStudents: number;
  overdueBooks: number;
  totalFineCollected: number;
  fineRate: number;
  recentActivities: Array<{
    id: string;
    type: 'issue' | 'return';
    issue_id?: string;
    return_id?: string;
    student_id: string;
    student_name: string;
    book_id: string;
    book_title: string;
    date: string;
    due_date?: string;
    status?: string;
    overdue_days?: number;
    fine_amount?: number;
    fine_status?: string;
  }>;
  categoryCounts: Record<string, { total: number; issued: number; available: number }>;
}

export interface ReturnReceipt {
  receiptNumber: string;
  returnId: string;
  issueId: string;
  studentId: string;
  studentName: string;
  department: string;
  bookId: string;
  bookTitle: string;
  issueDate: string;
  dueDate: string;
  returnDate: string;
  overdueDays: number;
  fineRate: number;
  fineAmount: number;
  fineStatus: string;
  paymentMethod: string;
  transactionRef: string;
  receivedBy: string;
  conditionNotes: string;
}
