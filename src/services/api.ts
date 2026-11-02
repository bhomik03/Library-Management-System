import {
  Book,
  BookIssue,
  BookReturn,
  DashboardStats,
  ReturnReceipt,
  Student,
  SystemSettings,
  User
} from '../types/library';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const rawText = await res.text();
    if (!res.ok) {
      throw new Error(`API error (${res.status}): ${rawText.slice(0, 120)}`);
    }
    throw new Error(`Expected JSON but received ${contentType || 'HTML/text'} from ${url}.`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Server request failed');
  }
  return data;
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ success: boolean; user: User; token: string }> {
    return fetchJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  async getUsers(): Promise<User[]> {
    return fetchJson('/api/auth/users');
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return fetchJson('/api/dashboard/stats');
  },

  // Books
  async getBooks(params?: { q?: string; category?: string; availability?: string }): Promise<Book[]> {
    const sp = new URLSearchParams();
    if (params?.q) sp.append('q', params.q);
    if (params?.category) sp.append('category', params.category);
    if (params?.availability) sp.append('availability', params.availability);
    const query = sp.toString() ? `?${sp.toString()}` : '';
    return fetchJson(`/api/books${query}`);
  },

  async getBookById(id: string): Promise<Book> {
    return fetchJson(`/api/books/${encodeURIComponent(id)}`);
  },

  async addBook(bookData: Partial<Book>): Promise<{ success: boolean; book: Book }> {
    return fetchJson('/api/books', {
      method: 'POST',
      body: JSON.stringify(bookData)
    });
  },

  async updateBook(id: string, updates: Partial<Book>): Promise<{ success: boolean; book: Book }> {
    return fetchJson(`/api/books/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteBook(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/books/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // Issues
  async getIssues(params?: { status?: string; student_id?: string; q?: string }): Promise<BookIssue[]> {
    const sp = new URLSearchParams();
    if (params?.status) sp.append('status', params.status);
    if (params?.student_id) sp.append('student_id', params.student_id);
    if (params?.q) sp.append('q', params.q);
    const query = sp.toString() ? `?${sp.toString()}` : '';
    return fetchJson(`/api/issues${query}`);
  },

  async checkEligibility(studentId: string): Promise<{
    student: Student;
    currentActiveLoans: number;
    maxLimit: number;
    canBorrow: boolean;
    activeIssues: BookIssue[];
    hasOverdue: boolean;
    reason: string | null;
  }> {
    return fetchJson(`/api/issues/check-eligibility?student_id=${encodeURIComponent(studentId)}`);
  },

  async issueBook(payload: {
    student_id: string;
    book_id: string;
    copy_barcode?: string;
    loan_days?: number;
    issued_by?: string;
    remarks?: string;
  }): Promise<{ success: boolean; message: string; issue: BookIssue; book: Book; student: Student }> {
    return fetchJson('/api/issues', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Returns
  async lookupReturn(query: string): Promise<Array<{
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
  }>> {
    return fetchJson(`/api/returns/lookup?q=${encodeURIComponent(query)}`);
  },

  async getReturns(): Promise<BookReturn[]> {
    return fetchJson('/api/returns');
  },

  async processReturn(payload: {
    issue_id: string;
    return_date?: string;
    condition_notes?: string;
    fine_status: 'none' | 'paid' | 'pending' | 'waived';
    payment_method?: 'cash' | 'upi' | 'card' | 'waived';
    transaction_ref?: string;
    received_by?: string;
  }): Promise<{ success: boolean; message: string; receipt: ReturnReceipt }> {
    return fetchJson('/api/returns', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Students
  async getStudents(params?: { q?: string; department?: string }): Promise<Student[]> {
    const sp = new URLSearchParams();
    if (params?.q) sp.append('q', params.q);
    if (params?.department) sp.append('department', params.department);
    const query = sp.toString() ? `?${sp.toString()}` : '';
    return fetchJson(`/api/students${query}`);
  },

  async getStudentHistory(studentId: string): Promise<{
    student: Student;
    activeIssues: BookIssue[];
    returnedIssues: BookIssue[];
    totalBorrowed: number;
    finePaidTotal: number;
  }> {
    return fetchJson(`/api/students/${encodeURIComponent(studentId)}/history`);
  },

  async addStudent(studentData: Partial<Student>): Promise<{ success: boolean; student: Student }> {
    return fetchJson('/api/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<{ success: boolean; student: Student }> {
    return fetchJson(`/api/students/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteStudent(id: string): Promise<{ success: boolean; message: string }> {
    return fetchJson(`/api/students/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // Reports
  async getReport(type: string, date?: string): Promise<any[]> {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return fetchJson(`/api/reports/${encodeURIComponent(type)}${query}`);
  },

  // Settings
  async getSettings(): Promise<SystemSettings> {
    return fetchJson('/api/settings');
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean; settings: SystemSettings }> {
    return fetchJson('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/database/reset', {
      method: 'POST'
    });
  }
};
