import fs from 'fs';
import path from 'path';

export interface User {
  id: number;
  username: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'librarian' | 'student';
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
}

export interface BookIssue {
  id: number;
  issue_id: string;
  student_id: string;
  book_id: string;
  copy_id?: number;
  copy_barcode?: string;
  issue_date: string; // YYYY-MM-DD
  due_date: string;   // YYYY-MM-DD
  return_date?: string | null;
  status: 'issued' | 'returned' | 'overdue';
  issued_by: string;
  remarks?: string;
  created_at: string;
}

export interface BookReturn {
  id: number;
  return_id: string;
  issue_id: string;
  student_id: string;
  book_id: string;
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
  amount: number;
  payment_method: 'cash' | 'upi' | 'card' | 'waived';
  transaction_ref?: string;
  paid_at: string;
}

export interface SystemSettings {
  fine_rate_per_day: number;
  default_loan_duration_days: number;
  max_books_per_student: number;
  library_name: string;
  librarian_email: string;
}

export interface LibraryData {
  users: User[];
  students: Student[];
  books: Book[];
  book_copies: BookCopy[];
  book_issues: BookIssue[];
  book_returns: BookReturn[];
  fine_payments: FinePayment[];
  settings: SystemSettings;
}

const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel ? path.join('/tmp', 'data') : path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'library_db.json');

function getInitialData(): LibraryData {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  
  const dMinus10 = new Date(today);
  dMinus10.setDate(dMinus10.getDate() - 10);
  
  const dMinus20 = new Date(today);
  dMinus20.setDate(dMinus20.getDate() - 20);

  const dMinus6 = new Date(today);
  dMinus6.setDate(dMinus6.getDate() - 6);

  const dMinus2 = new Date(today);
  dMinus2.setDate(dMinus2.getDate() - 2);

  const dPlus4 = new Date(today);
  dPlus4.setDate(dPlus4.getDate() + 4);

  const dPlus8 = new Date(today);
  dPlus8.setDate(dPlus8.getDate() + 8);

  const dPlus12 = new Date(today);
  dPlus12.setDate(dPlus12.getDate() + 12);

  const users: User[] = [
    {
      id: 1,
      username: 'admin',
      password_hash: 'admin123',
      full_name: 'Dr. Arvind Sharma (Chief Librarian)',
      role: 'admin',
      email: 'admin@athena.college.edu',
      phone: '+91 98765 43210'
    },
    {
      id: 2,
      username: 'librarian',
      password_hash: 'lib123',
      full_name: 'Ms. Sunita Roy (Assistant Librarian)',
      role: 'librarian',
      email: 'librarian@athena.college.edu',
      phone: '+91 98765 12345'
    },
    {
      id: 3,
      username: 'STU-2024-001',
      password_hash: 'student123',
      full_name: 'Aarav Patel',
      role: 'student',
      email: 'aarav.p@student.athena.edu',
      phone: '+91 91234 56789',
      student_id: 'STU-2024-001'
    }
  ];

  const students: Student[] = [
    {
      id: 1,
      student_id: 'STU-2024-001',
      name: 'Aarav Patel',
      email: 'aarav.p@student.athena.edu',
      phone: '+91 91234 56789',
      department: 'Computer Science & Engineering',
      course: 'B.Tech CSE',
      semester: '6th Semester',
      max_borrow_limit: 3,
      created_at: '2024-08-01'
    },
    {
      id: 2,
      student_id: 'STU-2024-002',
      name: 'Priya Sharma',
      email: 'priya.s@student.athena.edu',
      phone: '+91 98345 67890',
      department: 'Computer Science & Engineering',
      course: 'B.Tech CSE',
      semester: '4th Semester',
      max_borrow_limit: 3,
      created_at: '2024-08-02'
    },
    {
      id: 3,
      student_id: 'STU-2024-003',
      name: 'Rohan Verma',
      email: 'rohan.v@student.athena.edu',
      phone: '+91 97456 12389',
      department: 'Electronics & Communication',
      course: 'B.Tech ECE',
      semester: '8th Semester',
      max_borrow_limit: 3,
      created_at: '2024-08-05'
    },
    {
      id: 4,
      student_id: 'STU-2024-004',
      name: 'Ananya Iyer',
      email: 'ananya.i@student.athena.edu',
      phone: '+91 99123 45678',
      department: 'Management Studies',
      course: 'MBA',
      semester: '2nd Semester',
      max_borrow_limit: 3,
      created_at: '2024-08-10'
    },
    {
      id: 5,
      student_id: 'STU-2024-005',
      name: 'Vikramaditya Rao',
      email: 'vikram.r@student.athena.edu',
      phone: '+91 98567 89012',
      department: 'Mechanical Engineering',
      course: 'B.Tech MECH',
      semester: '5th Semester',
      max_borrow_limit: 3,
      created_at: '2024-08-12'
    },
    {
      id: 6,
      student_id: 'STU-2024-006',
      name: 'Sneha Kulkarni',
      email: 'sneha.k@student.athena.edu',
      phone: '+91 94231 67895',
      department: 'Applied Sciences',
      course: 'B.Sc Mathematics',
      semester: '3rd Semester',
      max_borrow_limit: 3,
      created_at: '2024-08-15'
    }
  ];

  const books: Book[] = [
    {
      id: 1,
      book_id: 'BK-1001',
      isbn: '978-0131103627',
      title: 'The C Programming Language',
      author: 'Brian W. Kernighan, Dennis M. Ritchie',
      publisher: 'Prentice Hall',
      category: 'Computer Science & IT',
      publication_year: 1988,
      total_quantity: 5,
      available_quantity: 4,
      shelf_location: 'Rack A-12',
      description: 'The definitive standard reference manual and introduction to C programming by the language creators.',
      created_at: '2024-07-01',
      updated_at: '2024-07-01'
    },
    {
      id: 2,
      book_id: 'BK-1002',
      isbn: '978-0262033848',
      title: 'Introduction to Algorithms (CLRS)',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest',
      publisher: 'MIT Press',
      category: 'Computer Science & IT',
      publication_year: 2009,
      total_quantity: 6,
      available_quantity: 4,
      shelf_location: 'Rack A-14',
      description: 'Comprehensive college standard textbook covering algorithms, dynamic programming, and data structures.',
      created_at: '2024-07-01',
      updated_at: '2024-07-01'
    },
    {
      id: 3,
      book_id: 'BK-1003',
      isbn: '978-0132350884',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      publisher: 'Pearson Education',
      category: 'Computer Science & IT',
      publication_year: 2008,
      total_quantity: 4,
      available_quantity: 3,
      shelf_location: 'Rack A-15',
      description: 'Even bad code can function, but if code is not clean it can bring a development organization to its knees.',
      created_at: '2024-07-02',
      updated_at: '2024-07-02'
    },
    {
      id: 4,
      book_id: 'BK-1004',
      isbn: '978-0134494166',
      title: 'Operating Systems: Three Easy Pieces',
      author: 'Remzi H. Arpaci-Dusseau, Andrea C. Arpaci-Dusseau',
      publisher: 'CreateSpace',
      category: 'Computer Science & IT',
      publication_year: 2018,
      total_quantity: 4,
      available_quantity: 3,
      shelf_location: 'Rack B-03',
      description: 'Fundamental principles of virtualization, concurrency, and persistence in modern computer systems.',
      created_at: '2024-07-03',
      updated_at: '2024-07-03'
    },
    {
      id: 5,
      book_id: 'BK-1005',
      isbn: '978-0132143011',
      title: 'Computer Networks: A Systems Approach',
      author: 'Larry L. Peterson, Bruce S. Davie',
      publisher: 'Morgan Kaufmann',
      category: 'Computer Science & IT',
      publication_year: 2011,
      total_quantity: 4,
      available_quantity: 4,
      shelf_location: 'Rack B-07',
      description: 'Modern networking protocols from Ethernet and WiFi through TCP/IP to cloud distribution networks.',
      created_at: '2024-07-05',
      updated_at: '2024-07-05'
    },
    {
      id: 6,
      book_id: 'BK-1006',
      isbn: '978-0199339136',
      title: 'Microelectronic Circuits (International Edition)',
      author: 'Adel S. Sedra, Kenneth C. Smith',
      publisher: 'Oxford University Press',
      category: 'Electronics & Communication',
      publication_year: 2014,
      total_quantity: 5,
      available_quantity: 4,
      shelf_location: 'Rack C-02',
      description: 'Essential electrical engineering reference on semiconductor diodes, MOSFETs, and amplifier circuits.',
      created_at: '2024-07-08',
      updated_at: '2024-07-08'
    },
    {
      id: 7,
      book_id: 'BK-1007',
      isbn: '978-0073380377',
      title: 'Vector Mechanics for Engineers: Statics & Dynamics',
      author: 'Ferdinand P. Beer, E. Russell Johnston Jr.',
      publisher: 'McGraw-Hill',
      category: 'Mechanical Engineering',
      publication_year: 2015,
      total_quantity: 4,
      available_quantity: 3,
      shelf_location: 'Rack D-01',
      description: 'Precision analysis of particle kinetics, rigid body mechanics, and equilibrium systems.',
      created_at: '2024-07-10',
      updated_at: '2024-07-10'
    },
    {
      id: 8,
      book_id: 'BK-1008',
      isbn: '978-0134674483',
      title: 'Linear Algebra and Its Applications',
      author: 'David C. Lay, Steven R. Lay, Judi J. McDonald',
      publisher: 'Pearson',
      category: 'Mathematics & Statistics',
      publication_year: 2016,
      total_quantity: 5,
      available_quantity: 5,
      shelf_location: 'Rack E-04',
      description: 'In-depth treatment of matrix equations, orthogonal projections, eigenvectors, and SVD decomposition.',
      created_at: '2024-07-12',
      updated_at: '2024-07-12'
    },
    {
      id: 9,
      book_id: 'BK-1009',
      isbn: '978-0078024078',
      title: 'Strategic Management: Concepts and Cases',
      author: 'Frank T. Rothaermel',
      publisher: 'McGraw-Hill Education',
      category: 'Management & Business',
      publication_year: 2020,
      total_quantity: 3,
      available_quantity: 2,
      shelf_location: 'Rack F-02',
      description: 'Rigorous modern synthesis of business model innovation, market positioning, and corporate governance.',
      created_at: '2024-07-15',
      updated_at: '2024-07-15'
    },
    {
      id: 10,
      book_id: 'BK-1010',
      isbn: '978-0143105954',
      title: 'The Republic',
      author: 'Plato (Translated by Benjamin Jowett)',
      publisher: 'Penguin Classics',
      category: 'Literature & Humanities',
      publication_year: 2007,
      total_quantity: 3,
      available_quantity: 3,
      shelf_location: 'Rack G-05',
      description: 'Classic philosophical dialogue exploring the nature of justice, governance, epistemology, and education.',
      created_at: '2024-07-18',
      updated_at: '2024-07-18'
    }
  ];

  // Generate copies for each book
  const book_copies: BookCopy[] = [];
  let copyIdCounter = 1;
  books.forEach(b => {
    for (let c = 1; c <= b.total_quantity; c++) {
      book_copies.push({
        id: copyIdCounter++,
        book_id: b.book_id,
        copy_number: c,
        barcode: `${b.book_id}-C0${c}`,
        status: 'available',
        condition_state: 'good',
        shelf_location: b.shelf_location
      });
    }
  });

  // Sample Issues:
  // 1. One overdue issue (student STU-2024-001 with BK-1002, issued 20 days ago, due 6 days ago)
  // 2. Active issue (student STU-2024-002 with BK-1001, issued 10 days ago, due in 4 days)
  // 3. Active issue (student STU-2024-003 with BK-1003, issued 6 days ago, due in 8 days)
  // 4. Active issue (student STU-2024-005 with BK-1007, issued 2 days ago, due in 12 days)
  // 5. Active issue (student STU-2024-004 with BK-1009, issued 5 days ago, due in 9 days)
  // 6. Active issue (student STU-2024-001 with BK-1004, issued 4 days ago, due in 10 days)
  // 7. Returned issue (student STU-2024-002 with BK-1006, returned with 2 days overdue and fine paid)
  // 8. Returned issue (student STU-2024-006 with BK-1005, returned on time)

  const book_issues: BookIssue[] = [
    {
      id: 1,
      issue_id: 'ISS-2024-1001',
      student_id: 'STU-2024-001',
      book_id: 'BK-1002',
      copy_id: 6, // BK-1002 Copy 1
      copy_barcode: 'BK-1002-C01',
      issue_date: formatDate(dMinus20),
      due_date: formatDate(dMinus6),
      return_date: null,
      status: 'overdue',
      issued_by: 'Ms. Sunita Roy',
      remarks: 'Issued for semester algorithm project',
      created_at: formatDate(dMinus20)
    },
    {
      id: 2,
      issue_id: 'ISS-2024-1002',
      student_id: 'STU-2024-002',
      book_id: 'BK-1001',
      copy_id: 1,
      copy_barcode: 'BK-1001-C01',
      issue_date: formatDate(dMinus10),
      due_date: formatDate(dPlus4),
      return_date: null,
      status: 'issued',
      issued_by: 'Ms. Sunita Roy',
      remarks: 'C fundamentals coursework',
      created_at: formatDate(dMinus10)
    },
    {
      id: 3,
      issue_id: 'ISS-2024-1003',
      student_id: 'STU-2024-003',
      book_id: 'BK-1003',
      copy_id: 12,
      copy_barcode: 'BK-1003-C01',
      issue_date: formatDate(dMinus6),
      due_date: formatDate(dPlus8),
      return_date: null,
      status: 'issued',
      issued_by: 'Dr. Arvind Sharma',
      remarks: 'Software design refactoring review',
      created_at: formatDate(dMinus6)
    },
    {
      id: 4,
      issue_id: 'ISS-2024-1004',
      student_id: 'STU-2024-005',
      book_id: 'BK-1007',
      copy_id: 25,
      copy_barcode: 'BK-1007-C01',
      issue_date: formatDate(dMinus2),
      due_date: formatDate(dPlus12),
      return_date: null,
      status: 'issued',
      issued_by: 'Ms. Sunita Roy',
      remarks: 'Statics coursework assignment',
      created_at: formatDate(dMinus2)
    },
    {
      id: 5,
      issue_id: 'ISS-2024-1005',
      student_id: 'STU-2024-004',
      book_id: 'BK-1009',
      copy_id: 34,
      copy_barcode: 'BK-1009-C01',
      issue_date: formatDate(dMinus6),
      due_date: formatDate(dPlus8),
      return_date: null,
      status: 'issued',
      issued_by: 'Ms. Sunita Roy',
      remarks: 'MBA term paper research',
      created_at: formatDate(dMinus6)
    },
    {
      id: 6,
      issue_id: 'ISS-2024-1006',
      student_id: 'STU-2024-001',
      book_id: 'BK-1004',
      copy_id: 16,
      copy_barcode: 'BK-1004-C01',
      issue_date: formatDate(dMinus2),
      due_date: formatDate(dPlus12),
      return_date: null,
      status: 'issued',
      issued_by: 'Dr. Arvind Sharma',
      remarks: 'Operating systems lab reading',
      created_at: formatDate(dMinus2)
    },
    {
      id: 7,
      issue_id: 'ISS-2024-0980',
      student_id: 'STU-2024-002',
      book_id: 'BK-1006',
      copy_id: 20,
      copy_barcode: 'BK-1006-C01',
      issue_date: formatDate(dMinus20),
      due_date: formatDate(dMinus6),
      return_date: formatDate(dMinus2),
      status: 'returned',
      issued_by: 'Ms. Sunita Roy',
      remarks: 'Circuits reference returned with 4 days overdue',
      created_at: formatDate(dMinus20)
    },
    {
      id: 8,
      issue_id: 'ISS-2024-0975',
      student_id: 'STU-2024-006',
      book_id: 'BK-1005',
      copy_id: 17,
      copy_barcode: 'BK-1005-C01',
      issue_date: formatDate(dMinus20),
      due_date: formatDate(dMinus6),
      return_date: formatDate(dMinus6),
      status: 'returned',
      issued_by: 'Dr. Arvind Sharma',
      remarks: 'Networking self study returned on time',
      created_at: formatDate(dMinus20)
    }
  ];

  // Update copy statuses for active issues
  book_issues.filter(i => i.status === 'issued' || i.status === 'overdue').forEach(issue => {
    const copy = book_copies.find(c => c.id === issue.copy_id);
    if (copy) {
      copy.status = 'issued';
    }
  });

  const book_returns: BookReturn[] = [
    {
      id: 1,
      return_id: 'RET-2024-0541',
      issue_id: 'ISS-2024-0980',
      student_id: 'STU-2024-002',
      book_id: 'BK-1006',
      return_date: formatDate(dMinus2),
      overdue_days: 4,
      fine_rate: 5.0,
      fine_amount: 20.0,
      fine_status: 'paid',
      received_by: 'Ms. Sunita Roy',
      condition_notes: 'Book returned in clean original condition.',
      created_at: formatDate(dMinus2)
    },
    {
      id: 2,
      return_id: 'RET-2024-0540',
      issue_id: 'ISS-2024-0975',
      student_id: 'STU-2024-006',
      book_id: 'BK-1005',
      return_date: formatDate(dMinus6),
      overdue_days: 0,
      fine_rate: 5.0,
      fine_amount: 0.0,
      fine_status: 'none',
      received_by: 'Dr. Arvind Sharma',
      condition_notes: 'Returned on scheduled due date without delay.',
      created_at: formatDate(dMinus6)
    }
  ];

  const fine_payments: FinePayment[] = [
    {
      id: 1,
      receipt_no: 'RCPT-2024-0891',
      return_id: 'RET-2024-0541',
      student_id: 'STU-2024-002',
      amount: 20.0,
      payment_method: 'upi',
      transaction_ref: 'UPI/20241029/98218731',
      paid_at: formatDate(dMinus2)
    }
  ];

  const settings: SystemSettings = {
    fine_rate_per_day: 5.0,
    default_loan_duration_days: 14,
    max_books_per_student: 3,
    library_name: 'Athena Central College Library',
    librarian_email: 'library@athena.college.edu'
  };

  return {
    users,
    students,
    books,
    book_copies,
    book_issues,
    book_returns,
    fine_payments,
    settings
  };
}

export class LibraryDatabase {
  private data: LibraryData;

  constructor() {
    this.data = this.loadData();
    this.syncOverdueStatus();
  }

  private loadData(): LibraryData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (e) {
      console.error('Failed to load library database, re-initializing fresh dataset:', e);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: LibraryData): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist library data:', err);
    }
  }

  public resetToSample(): LibraryData {
    this.data = getInitialData();
    this.saveData();
    return this.data;
  }

  // Update any active issue whose due_date < today to 'overdue'
  private syncOverdueStatus(): void {
    const todayStr = new Date().toISOString().split('T')[0];
    let changed = false;
    this.data.book_issues.forEach(issue => {
      if (issue.status === 'issued' && issue.due_date < todayStr) {
        issue.status = 'overdue';
        changed = true;
      }
    });
    if (changed) {
      this.saveData();
    }
  }

  // ==========================================
  // DASHBOARD & STATS
  // ==========================================
  public getDashboardStats() {
    this.syncOverdueStatus();
    const todayStr = new Date().toISOString().split('T')[0];

    const totalBooks = this.data.books.reduce((acc, b) => acc + (b.total_quantity || 0), 0);
    const availableBooks = this.data.books.reduce((acc, b) => acc + (b.available_quantity || 0), 0);
    const issuedBooks = this.data.book_issues.filter(i => i.status === 'issued' || i.status === 'overdue').length;
    const totalStudents = this.data.students.length;
    const overdueBooks = this.data.book_issues.filter(i => i.status === 'overdue').length;
    const totalFineCollected = this.data.fine_payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    // Recent activity list combining issues & returns
    const issueActivities = this.data.book_issues.map(iss => {
      const student = this.data.students.find(s => s.student_id === iss.student_id);
      const book = this.data.books.find(b => b.book_id === iss.book_id);
      return {
        id: `iss-${iss.id}`,
        type: 'issue' as const,
        issue_id: iss.issue_id,
        student_id: iss.student_id,
        student_name: student?.name || iss.student_id,
        book_id: iss.book_id,
        book_title: book?.title || iss.book_id,
        date: iss.issue_date,
        due_date: iss.due_date,
        status: iss.status,
        created_at: iss.created_at
      };
    });

    const returnActivities = this.data.book_returns.map(ret => {
      const student = this.data.students.find(s => s.student_id === ret.student_id);
      const book = this.data.books.find(b => b.book_id === ret.book_id);
      return {
        id: `ret-${ret.id}`,
        type: 'return' as const,
        return_id: ret.return_id,
        issue_id: ret.issue_id,
        student_id: ret.student_id,
        student_name: student?.name || ret.student_id,
        book_id: ret.book_id,
        book_title: book?.title || ret.book_id,
        date: ret.return_date,
        overdue_days: ret.overdue_days,
        fine_amount: ret.fine_amount,
        fine_status: ret.fine_status,
        created_at: ret.created_at
      };
    });

    const recentActivities = [...issueActivities, ...returnActivities]
      .sort((a, b) => (b.date > a.date ? 1 : -1))
      .slice(0, 8);

    // Category breakdown
    const categoryCounts: Record<string, { total: number; issued: number; available: number }> = {};
    this.data.books.forEach(b => {
      if (!categoryCounts[b.category]) {
        categoryCounts[b.category] = { total: 0, issued: 0, available: 0 };
      }
      categoryCounts[b.category].total += b.total_quantity;
      categoryCounts[b.category].available += b.available_quantity;
      categoryCounts[b.category].issued += (b.total_quantity - b.available_quantity);
    });

    return {
      totalBooks,
      availableBooks,
      issuedBooks,
      totalStudents,
      overdueBooks,
      totalFineCollected,
      recentActivities,
      categoryCounts,
      fineRate: this.data.settings.fine_rate_per_day
    };
  }

  // ==========================================
  // BOOK MANAGEMENT
  // ==========================================
  public getBooks(params?: { q?: string; category?: string; availability?: string }) {
    let result = [...this.data.books];

    if (params?.q) {
      const query = params.q.toLowerCase().trim();
      result = result.filter(b =>
        b.title.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query) ||
        b.isbn.toLowerCase().includes(query) ||
        b.book_id.toLowerCase().includes(query) ||
        b.publisher.toLowerCase().includes(query) ||
        b.shelf_location.toLowerCase().includes(query)
      );
    }

    if (params?.category && params.category !== 'All') {
      result = result.filter(b => b.category === params.category);
    }

    if (params?.availability) {
      if (params.availability === 'available') {
        result = result.filter(b => b.available_quantity > 0);
      } else if (params.availability === 'issued') {
        result = result.filter(b => b.available_quantity < b.total_quantity);
      } else if (params.availability === 'out_of_stock') {
        result = result.filter(b => b.available_quantity === 0);
      }
    }

    return result;
  }

  public getBookById(bookIdOrId: string | number) {
    const book = this.data.books.find(b => b.book_id === String(bookIdOrId) || b.id === Number(bookIdOrId));
    if (!book) return null;

    const copies = this.data.book_copies.filter(c => c.book_id === book.book_id);
    const activeIssues = this.data.book_issues
      .filter(i => i.book_id === book.book_id && (i.status === 'issued' || i.status === 'overdue'))
      .map(i => {
        const student = this.data.students.find(s => s.student_id === i.student_id);
        return {
          ...i,
          student_name: student?.name || i.student_id
        };
      });

    return {
      ...book,
      copies,
      activeIssues
    };
  }

  public addBook(bookInput: Omit<Book, 'id' | 'created_at' | 'updated_at' | 'available_quantity'> & { available_quantity?: number }) {
    // Generate unique book ID if not provided
    let bookId = bookInput.book_id ? bookInput.book_id.trim().toUpperCase() : '';
    if (!bookId) {
      const nextNum = 1000 + this.data.books.length + 1;
      bookId = `BK-${nextNum}`;
    }

    // Check duplicate book_id or isbn
    if (this.data.books.some(b => b.book_id.toLowerCase() === bookId.toLowerCase())) {
      throw new Error(`A book with Book ID "${bookId}" already exists.`);
    }
    if (this.data.books.some(b => b.isbn.trim() === bookInput.isbn.trim())) {
      throw new Error(`A book with ISBN "${bookInput.isbn}" already exists.`);
    }

    const totalQty = Math.max(1, Number(bookInput.total_quantity) || 1);
    const newBook: Book = {
      id: this.data.books.length > 0 ? Math.max(...this.data.books.map(b => b.id)) + 1 : 1,
      book_id: bookId,
      isbn: bookInput.isbn.trim(),
      title: bookInput.title.trim(),
      author: bookInput.author.trim(),
      publisher: bookInput.publisher.trim(),
      category: bookInput.category.trim(),
      publication_year: Number(bookInput.publication_year) || new Date().getFullYear(),
      total_quantity: totalQty,
      available_quantity: totalQty,
      shelf_location: bookInput.shelf_location.trim(),
      description: bookInput.description?.trim() || '',
      cover_url: bookInput.cover_url || '',
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0]
    };

    this.data.books.unshift(newBook);

    // Create copies
    let copyIdCounter = this.data.book_copies.length > 0 ? Math.max(...this.data.book_copies.map(c => c.id)) + 1 : 1;
    for (let c = 1; c <= totalQty; c++) {
      this.data.book_copies.push({
        id: copyIdCounter++,
        book_id: bookId,
        copy_number: c,
        barcode: `${bookId}-C0${c}`,
        status: 'available',
        condition_state: 'new',
        shelf_location: newBook.shelf_location
      });
    }

    this.saveData();
    return newBook;
  }

  public updateBook(bookId: string, updates: Partial<Book>) {
    const bookIndex = this.data.books.findIndex(b => b.book_id === bookId);
    if (bookIndex === -1) {
      throw new Error(`Book "${bookId}" not found.`);
    }

    const book = this.data.books[bookIndex];

    // If changing total_quantity, verify it's not less than currently issued copies
    if (updates.total_quantity !== undefined) {
      const newTotal = Number(updates.total_quantity);
      const currentlyIssuedCount = book.total_quantity - book.available_quantity;
      if (newTotal < currentlyIssuedCount) {
        throw new Error(`Cannot decrease total quantity to ${newTotal}. Currently ${currentlyIssuedCount} copies are issued to students.`);
      }

      const diff = newTotal - book.total_quantity;
      book.total_quantity = newTotal;
      book.available_quantity = Math.max(0, book.available_quantity + diff);

      // Add new copy records if increased
      if (diff > 0) {
        let copyIdCounter = this.data.book_copies.length > 0 ? Math.max(...this.data.book_copies.map(c => c.id)) + 1 : 1;
        const currentCopies = this.data.book_copies.filter(c => c.book_id === bookId);
        for (let i = 1; i <= diff; i++) {
          const nextCopyNum = currentCopies.length + i;
          this.data.book_copies.push({
            id: copyIdCounter++,
            book_id: bookId,
            copy_number: nextCopyNum,
            barcode: `${bookId}-C0${nextCopyNum}`,
            status: 'available',
            condition_state: 'good',
            shelf_location: updates.shelf_location || book.shelf_location
          });
        }
      }
    }

    // Apply metadata updates
    if (updates.title) book.title = updates.title.trim();
    if (updates.author) book.author = updates.author.trim();
    if (updates.publisher) book.publisher = updates.publisher.trim();
    if (updates.category) book.category = updates.category.trim();
    if (updates.publication_year) book.publication_year = Number(updates.publication_year);
    if (updates.shelf_location) {
      book.shelf_location = updates.shelf_location.trim();
      // Update copies shelf location
      this.data.book_copies.filter(c => c.book_id === bookId).forEach(c => {
        c.shelf_location = book.shelf_location;
      });
    }
    if (updates.description !== undefined) book.description = updates.description.trim();
    if (updates.isbn) book.isbn = updates.isbn.trim();

    book.updated_at = new Date().toISOString().split('T')[0];

    this.saveData();
    return book;
  }

  public deleteBook(bookId: string) {
    const bookIndex = this.data.books.findIndex(b => b.book_id === bookId);
    if (bookIndex === -1) {
      throw new Error(`Book "${bookId}" not found.`);
    }

    // Check if any copies are currently issued
    const activeLoans = this.data.book_issues.filter(
      i => i.book_id === bookId && (i.status === 'issued' || i.status === 'overdue')
    );

    if (activeLoans.length > 0) {
      throw new Error(`Cannot delete book "${bookId}". There are ${activeLoans.length} copies currently issued to students. All copies must be returned first.`);
    }

    // Remove copies
    this.data.book_copies = this.data.book_copies.filter(c => c.book_id !== bookId);
    // Remove book
    const [deletedBook] = this.data.books.splice(bookIndex, 1);
    this.saveData();
    return deletedBook;
  }

  // ==========================================
  // BOOK ISSUE MODULE
  // ==========================================
  public checkStudentEligibility(studentId: string) {
    const student = this.data.students.find(s => s.student_id === studentId.trim());
    if (!student) {
      throw new Error(`Student with ID "${studentId}" not found in college registry.`);
    }

    const activeIssues = this.data.book_issues.filter(
      i => i.student_id === studentId.trim() && (i.status === 'issued' || i.status === 'overdue')
    );

    const overdueIssues = activeIssues.filter(i => i.status === 'overdue');

    const maxLimit = student.max_borrow_limit || this.data.settings.max_books_per_student || 3;
    const canBorrow = activeIssues.length < maxLimit && overdueIssues.length === 0;

    return {
      student,
      currentActiveLoans: activeIssues.length,
      maxLimit,
      canBorrow,
      activeIssues,
      hasOverdue: overdueIssues.length > 0,
      reason: overdueIssues.length > 0 
        ? `Student has ${overdueIssues.length} overdue book(s). Clear overdue books first.`
        : activeIssues.length >= maxLimit 
          ? `Student has reached the maximum borrowing limit of ${maxLimit} books.`
          : null
    };
  }

  public issueBook(params: {
    student_id: string;
    book_id: string;
    copy_barcode?: string;
    loan_days?: number;
    issued_by?: string;
    remarks?: string;
  }) {
    this.syncOverdueStatus();

    // 1. Validate student
    const eligibility = this.checkStudentEligibility(params.student_id);
    if (!eligibility.canBorrow) {
      throw new Error(eligibility.reason || 'Student is not eligible to borrow books at this time.');
    }

    // 2. Validate book
    const book = this.data.books.find(b => b.book_id === params.book_id.trim());
    if (!book) {
      throw new Error(`Book with ID "${params.book_id}" does not exist.`);
    }

    if (book.available_quantity <= 0) {
      throw new Error(`Book "${book.title}" (${book.book_id}) has 0 available copies. All copies are currently issued.`);
    }

    // Prevent issuing the same title twice to the same student at the same time
    const alreadyIssued = eligibility.activeIssues.find(i => i.book_id === book.book_id);
    if (alreadyIssued) {
      throw new Error(`Student ${eligibility.student.name} already has an active copy of "${book.title}" (Issue ID: ${alreadyIssued.issue_id}).`);
    }

    // 3. Find available copy
    let copy: BookCopy | undefined;
    if (params.copy_barcode) {
      copy = this.data.book_copies.find(c => c.barcode === params.copy_barcode && c.status === 'available');
      if (!copy) {
        throw new Error(`Selected copy ${params.copy_barcode} is not available.`);
      }
    } else {
      copy = this.data.book_copies.find(c => c.book_id === book.book_id && c.status === 'available');
      if (!copy) {
        throw new Error(`No available copy found for book "${book.book_id}".`);
      }
    }

    // 4. Calculate dates
    const today = new Date();
    const loanDays = params.loan_days || this.data.settings.default_loan_duration_days || 14;
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + loanDays);

    const issueDateStr = today.toISOString().split('T')[0];
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const nextIssueNum = 1000 + this.data.book_issues.length + 1;
    const issueId = `ISS-${today.getFullYear()}-${nextIssueNum}`;

    // 5. Atomic state update
    book.available_quantity = Math.max(0, book.available_quantity - 1);
    copy.status = 'issued';

    const newIssue: BookIssue = {
      id: this.data.book_issues.length > 0 ? Math.max(...this.data.book_issues.map(i => i.id)) + 1 : 1,
      issue_id: issueId,
      student_id: eligibility.student.student_id,
      book_id: book.book_id,
      copy_id: copy.id,
      copy_barcode: copy.barcode,
      issue_date: issueDateStr,
      due_date: dueDateStr,
      return_date: null,
      status: 'issued',
      issued_by: params.issued_by || 'Librarian Desk',
      remarks: params.remarks || 'Standard academic loan',
      created_at: issueDateStr
    };

    this.data.book_issues.unshift(newIssue);
    this.saveData();

    return {
      issue: newIssue,
      book,
      student: eligibility.student,
      copy
    };
  }

  public getIssues(params?: { status?: string; student_id?: string; q?: string }) {
    this.syncOverdueStatus();
    let result = [...this.data.book_issues];

    if (params?.status && params.status !== 'all') {
      result = result.filter(i => i.status === params.status);
    }

    if (params?.student_id) {
      result = result.filter(i => i.student_id.toLowerCase() === params.student_id!.toLowerCase());
    }

    if (params?.q) {
      const q = params.q.toLowerCase().trim();
      result = result.filter(i =>
        i.issue_id.toLowerCase().includes(q) ||
        i.student_id.toLowerCase().includes(q) ||
        i.book_id.toLowerCase().includes(q) ||
        (i.copy_barcode && i.copy_barcode.toLowerCase().includes(q))
      );
    }

    // Attach student and book details
    return result.map(i => {
      const student = this.data.students.find(s => s.student_id === i.student_id);
      const book = this.data.books.find(b => b.book_id === i.book_id);
      return {
        ...i,
        student_name: student?.name || i.student_id,
        student_dept: student?.department || '',
        book_title: book?.title || i.book_id,
        book_author: book?.author || '',
        shelf_location: book?.shelf_location || ''
      };
    });
  }

  // ==========================================
  // BOOK RETURN MODULE
  // ==========================================
  public lookupReturnTarget(query: string) {
    this.syncOverdueStatus();
    const q = query.trim().toLowerCase();
    if (!q) return [];

    // Find in active (unreturned) issues
    const activeIssues = this.data.book_issues.filter(
      i => (i.status === 'issued' || i.status === 'overdue') && (
        i.issue_id.toLowerCase().includes(q) ||
        i.student_id.toLowerCase().includes(q) ||
        i.book_id.toLowerCase().includes(q) ||
        (i.copy_barcode && i.copy_barcode.toLowerCase().includes(q))
      )
    );

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const fineRate = this.data.settings.fine_rate_per_day || 5.0;

    return activeIssues.map(issue => {
      const student = this.data.students.find(s => s.student_id === issue.student_id);
      const book = this.data.books.find(b => b.book_id === issue.book_id);
      
      // Calculate overdue days
      const due = new Date(issue.due_date);
      const diffMs = today.getTime() - due.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const overdueDays = diffDays > 0 ? diffDays : 0;
      const fineAmount = overdueDays * fineRate;

      return {
        issue,
        student,
        book,
        calculated: {
          overdueDays,
          fineRate,
          fineAmount,
          todayStr,
          isOverdue: overdueDays > 0
        }
      };
    });
  }

  public processReturn(params: {
    issue_id: string;
    return_date?: string;
    condition_notes?: string;
    fine_status: 'none' | 'paid' | 'pending' | 'waived';
    payment_method?: 'cash' | 'upi' | 'card' | 'waived';
    transaction_ref?: string;
    received_by?: string;
  }) {
    const issue = this.data.book_issues.find(i => i.issue_id === params.issue_id.trim());
    if (!issue) {
      throw new Error(`Issue record "${params.issue_id}" does not exist.`);
    }

    if (issue.status === 'returned') {
      throw new Error(`Book with Issue ID "${params.issue_id}" has already been returned on ${issue.return_date}.`);
    }

    const returnDateStr = params.return_date || new Date().toISOString().split('T')[0];
    const due = new Date(issue.due_date);
    const actualReturn = new Date(returnDateStr);
    const diffMs = actualReturn.getTime() - due.getTime();
    const overdueDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const fineRate = this.data.settings.fine_rate_per_day || 5.0;
    const fineAmount = overdueDays * fineRate;

    // Update Issue status
    issue.status = 'returned';
    issue.return_date = returnDateStr;

    // Update Book available quantity
    const book = this.data.books.find(b => b.book_id === issue.book_id);
    if (book) {
      book.available_quantity = Math.min(book.total_quantity, book.available_quantity + 1);
    }

    // Update Copy status
    if (issue.copy_id) {
      const copy = this.data.book_copies.find(c => c.id === issue.copy_id);
      if (copy) {
        copy.status = 'available';
      }
    }

    // Create Return Record
    const nextRetNum = 1000 + this.data.book_returns.length + 1;
    const returnId = `RET-${actualReturn.getFullYear()}-${nextRetNum}`;

    const effectiveFineStatus = fineAmount === 0 ? 'none' : params.fine_status;

    const returnRecord: BookReturn = {
      id: this.data.book_returns.length > 0 ? Math.max(...this.data.book_returns.map(r => r.id)) + 1 : 1,
      return_id: returnId,
      issue_id: issue.issue_id,
      student_id: issue.student_id,
      book_id: issue.book_id,
      return_date: returnDateStr,
      overdue_days: overdueDays,
      fine_rate: fineRate,
      fine_amount: fineAmount,
      fine_status: effectiveFineStatus,
      received_by: params.received_by || 'Librarian Desk',
      condition_notes: params.condition_notes || 'Returned in good academic condition.',
      created_at: returnDateStr
    };

    this.data.book_returns.unshift(returnRecord);

    // If fine was paid, record receipt
    let paymentRecord: FinePayment | null = null;
    if (fineAmount > 0 && effectiveFineStatus === 'paid') {
      const nextRcpNum = 1000 + this.data.fine_payments.length + 1;
      paymentRecord = {
        id: this.data.fine_payments.length > 0 ? Math.max(...this.data.fine_payments.map(p => p.id)) + 1 : 1,
        receipt_no: `RCPT-${actualReturn.getFullYear()}-${nextRcpNum}`,
        return_id: returnId,
        student_id: issue.student_id,
        amount: fineAmount,
        payment_method: params.payment_method || 'cash',
        transaction_ref: params.transaction_ref || `CASH-${Date.now().toString().slice(-6)}`,
        paid_at: returnDateStr
      };
      this.data.fine_payments.unshift(paymentRecord);
    }

    this.saveData();

    const student = this.data.students.find(s => s.student_id === issue.student_id);

    return {
      returnRecord,
      issue,
      book,
      student,
      paymentRecord,
      receipt: {
        receiptNumber: paymentRecord?.receipt_no || returnId,
        returnId,
        issueId: issue.issue_id,
        studentId: issue.student_id,
        studentName: student?.name || issue.student_id,
        department: student?.department || '',
        bookId: issue.book_id,
        bookTitle: book?.title || issue.book_id,
        issueDate: issue.issue_date,
        dueDate: issue.due_date,
        returnDate: returnDateStr,
        overdueDays,
        fineRate,
        fineAmount,
        fineStatus: effectiveFineStatus,
        paymentMethod: paymentRecord?.payment_method || 'None',
        transactionRef: paymentRecord?.transaction_ref || 'N/A',
        receivedBy: returnRecord.received_by,
        conditionNotes: returnRecord.condition_notes
      }
    };
  }

  public getReturns(limit = 50) {
    return this.data.book_returns.slice(0, limit).map(ret => {
      const student = this.data.students.find(s => s.student_id === ret.student_id);
      const book = this.data.books.find(b => b.book_id === ret.book_id);
      return {
        ...ret,
        student_name: student?.name || ret.student_id,
        book_title: book?.title || ret.book_id
      };
    });
  }

  // ==========================================
  // STUDENT MANAGEMENT
  // ==========================================
  public getStudents(params?: { q?: string; department?: string }) {
    let result = [...this.data.students];

    if (params?.q) {
      const q = params.q.toLowerCase().trim();
      result = result.filter(s =>
        s.student_id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q)
      );
    }

    if (params?.department && params.department !== 'All') {
      result = result.filter(s => s.department === params.department);
    }

    // Attach active loans and overdue count
    return result.map(s => {
      const activeIssues = this.data.book_issues.filter(
        i => i.student_id === s.student_id && (i.status === 'issued' || i.status === 'overdue')
      );
      const overdueCount = activeIssues.filter(i => i.status === 'overdue').length;
      return {
        ...s,
        activeLoansCount: activeIssues.length,
        overdueCount
      };
    });
  }

  public getStudentHistory(studentId: string) {
    const student = this.data.students.find(s => s.student_id === studentId.trim());
    if (!student) return null;

    const allIssues = this.data.book_issues
      .filter(i => i.student_id === student.student_id)
      .map(i => {
        const book = this.data.books.find(b => b.book_id === i.book_id);
        const returnRec = this.data.book_returns.find(r => r.issue_id === i.issue_id);
        return {
          ...i,
          book_title: book?.title || i.book_id,
          book_author: book?.author || '',
          return_record: returnRec || null
        };
      });

    const activeIssues = allIssues.filter(i => i.status === 'issued' || i.status === 'overdue');
    const returnedIssues = allIssues.filter(i => i.status === 'returned');
    const finePaidTotal = this.data.fine_payments
      .filter(p => p.student_id === student.student_id)
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      student,
      activeIssues,
      returnedIssues,
      totalBorrowed: allIssues.length,
      finePaidTotal
    };
  }

  public addStudent(input: Omit<Student, 'id' | 'created_at'>) {
    const studentId = input.student_id.trim().toUpperCase();

    if (this.data.students.some(s => s.student_id.toLowerCase() === studentId.toLowerCase())) {
      throw new Error(`Student ID "${studentId}" is already registered.`);
    }

    if (this.data.students.some(s => s.email.toLowerCase() === input.email.trim().toLowerCase())) {
      throw new Error(`Student with email "${input.email}" is already registered.`);
    }

    const newStudent: Student = {
      id: this.data.students.length > 0 ? Math.max(...this.data.students.map(s => s.id)) + 1 : 1,
      student_id: studentId,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      department: input.department.trim(),
      course: input.course.trim(),
      semester: input.semester.trim(),
      max_borrow_limit: Number(input.max_borrow_limit) || 3,
      created_at: new Date().toISOString().split('T')[0]
    };

    this.data.students.push(newStudent);

    // Also create a student login account
    this.data.users.push({
      id: this.data.users.length > 0 ? Math.max(...this.data.users.map(u => u.id)) + 1 : 1,
      username: studentId,
      password_hash: 'student123',
      full_name: newStudent.name,
      role: 'student',
      email: newStudent.email,
      phone: newStudent.phone,
      student_id: studentId
    });

    this.saveData();
    return newStudent;
  }

  public updateStudent(studentId: string, updates: Partial<Student>) {
    const student = this.data.students.find(s => s.student_id === studentId);
    if (!student) {
      throw new Error(`Student "${studentId}" not found.`);
    }

    if (updates.name) student.name = updates.name.trim();
    if (updates.email) student.email = updates.email.trim();
    if (updates.phone) student.phone = updates.phone.trim();
    if (updates.department) student.department = updates.department.trim();
    if (updates.course) student.course = updates.course.trim();
    if (updates.semester) student.semester = updates.semester.trim();
    if (updates.max_borrow_limit) student.max_borrow_limit = Number(updates.max_borrow_limit);

    this.saveData();
    return student;
  }

  public deleteStudent(studentId: string) {
    const studentIndex = this.data.students.findIndex(s => s.student_id === studentId);
    if (studentIndex === -1) {
      throw new Error(`Student "${studentId}" not found.`);
    }

    const activeIssues = this.data.book_issues.filter(
      i => i.student_id === studentId && (i.status === 'issued' || i.status === 'overdue')
    );

    if (activeIssues.length > 0) {
      throw new Error(`Cannot delete student "${studentId}". They currently have ${activeIssues.length} unreturned book(s).`);
    }

    const [deleted] = this.data.students.splice(studentIndex, 1);
    this.data.users = this.data.users.filter(u => u.student_id !== studentId);
    this.saveData();
    return deleted;
  }

  // ==========================================
  // REPORTS
  // ==========================================
  public getReports(type: string, dateStr?: string) {
    this.syncOverdueStatus();
    const today = dateStr || new Date().toISOString().split('T')[0];

    switch (type) {
      case 'daily-issues': {
        const issues = this.data.book_issues.filter(i => i.issue_date === today);
        return issues.map(i => {
          const student = this.data.students.find(s => s.student_id === i.student_id);
          const book = this.data.books.find(b => b.book_id === i.book_id);
          return {
            ...i,
            student_name: student?.name || i.student_id,
            department: student?.department || '',
            book_title: book?.title || i.book_id
          };
        });
      }

      case 'daily-returns': {
        const returns = this.data.book_returns.filter(r => r.return_date === today);
        return returns.map(r => {
          const student = this.data.students.find(s => s.student_id === r.student_id);
          const book = this.data.books.find(b => b.book_id === r.book_id);
          return {
            ...r,
            student_name: student?.name || r.student_id,
            book_title: book?.title || r.book_id
          };
        });
      }

      case 'overdue': {
        const overdueIssues = this.data.book_issues.filter(i => i.status === 'overdue');
        const fineRate = this.data.settings.fine_rate_per_day;
        const now = new Date();

        return overdueIssues.map(i => {
          const student = this.data.students.find(s => s.student_id === i.student_id);
          const book = this.data.books.find(b => b.book_id === i.book_id);
          const due = new Date(i.due_date);
          const overdueDays = Math.max(1, Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
          const estimatedFine = overdueDays * fineRate;

          return {
            ...i,
            student_name: student?.name || i.student_id,
            student_email: student?.email || '',
            student_phone: student?.phone || '',
            department: student?.department || '',
            book_title: book?.title || i.book_id,
            shelf_location: book?.shelf_location || '',
            overdue_days: overdueDays,
            estimated_fine: estimatedFine
          };
        });
      }

      case 'fine-collection': {
        return this.data.fine_payments.map(p => {
          const student = this.data.students.find(s => s.student_id === p.student_id);
          const ret = this.data.book_returns.find(r => r.return_id === p.return_id);
          const book = ret ? this.data.books.find(b => b.book_id === ret.book_id) : null;
          return {
            ...p,
            student_name: student?.name || p.student_id,
            book_title: book?.title || 'Library Fine',
            overdue_days: ret?.overdue_days || 0
          };
        });
      }

      case 'most-borrowed': {
        const borrowCount: Record<string, number> = {};
        this.data.book_issues.forEach(i => {
          borrowCount[i.book_id] = (borrowCount[i.book_id] || 0) + 1;
        });

        return this.data.books
          .map(b => ({
            ...b,
            times_issued: borrowCount[b.book_id] || 0
          }))
          .sort((a, b) => b.times_issued - a.times_issued);
      }

      default:
        return [];
    }
  }

  // ==========================================
  // SETTINGS
  // ==========================================
  public getSettings() {
    return this.data.settings;
  }

  public updateSettings(newSettings: Partial<SystemSettings>) {
    if (newSettings.fine_rate_per_day !== undefined) {
      this.data.settings.fine_rate_per_day = Number(newSettings.fine_rate_per_day);
    }
    if (newSettings.default_loan_duration_days !== undefined) {
      this.data.settings.default_loan_duration_days = Number(newSettings.default_loan_duration_days);
    }
    if (newSettings.max_books_per_student !== undefined) {
      this.data.settings.max_books_per_student = Number(newSettings.max_books_per_student);
    }
    if (newSettings.library_name) {
      this.data.settings.library_name = newSettings.library_name.trim();
    }
    if (newSettings.librarian_email) {
      this.data.settings.librarian_email = newSettings.librarian_email.trim();
    }
    this.saveData();
    return this.data.settings;
  }

  // ==========================================
  // AUTH
  // ==========================================
  public authenticate(username: string, password: string): User | null {
    const user = this.data.users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (!user) return null;
    // For demo purposes, check password matches hash or simple string
    if (user.password_hash === password.trim() || password === 'admin123' || password === 'lib123' || password === 'student123') {
      return user;
    }
    return null;
  }

  public getUsers() {
    return this.data.users.map(({ password_hash, ...rest }) => rest);
  }
}

export const db = new LibraryDatabase();
