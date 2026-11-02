import express, { Request, Response } from 'express';
import { db } from './db.ts';

export const app = express();

app.use(express.json());

// -------------------------------------------------------------
// HEALTH CHECK
// -------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Athena Library API', timestamp: new Date().toISOString() });
});

// -------------------------------------------------------------
// AUTH REST APIS
// -------------------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = db.authenticate(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify username and password.' });
    }

    const { password_hash, ...safeUser } = user;
    return res.json({
      success: true,
      user: safeUser,
      token: `athena_token_${user.id}_${Date.now()}`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Authentication failed' });
  }
});

app.get('/api/auth/users', (_req: Request, res: Response) => {
  res.json(db.getUsers());
});

// -------------------------------------------------------------
// DASHBOARD REST APIS
// -------------------------------------------------------------
app.get('/api/dashboard/stats', (_req: Request, res: Response) => {
  try {
    const stats = db.getDashboardStats();
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to retrieve stats' });
  }
});

// -------------------------------------------------------------
// BOOK MANAGEMENT REST APIS
// -------------------------------------------------------------
app.get('/api/books', (req: Request, res: Response) => {
  try {
    const { q, category, availability } = req.query;
    const books = db.getBooks({
      q: q ? String(q) : undefined,
      category: category ? String(category) : undefined,
      availability: availability ? String(availability) : undefined
    });
    return res.json(books);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch books' });
  }
});

app.get('/api/books/:id', (req: Request, res: Response) => {
  try {
    const book = db.getBookById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: `Book ${req.params.id} not found` });
    }
    return res.json(book);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch book details' });
  }
});

app.post('/api/books', (req: Request, res: Response) => {
  try {
    const { isbn, title, author, publisher, category, publication_year, total_quantity, shelf_location, description, book_id } = req.body;
    if (!isbn || !title || !author || !category || !shelf_location) {
      return res.status(400).json({ error: 'Please provide ISBN, Title, Author, Category, and Shelf Location' });
    }

    const newBook = db.addBook({
      book_id,
      isbn,
      title,
      author,
      publisher: publisher || 'Institutional Publishing',
      category,
      publication_year: Number(publication_year) || new Date().getFullYear(),
      total_quantity: Number(total_quantity) || 1,
      shelf_location,
      description
    });

    return res.status(201).json({ success: true, book: newBook });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Could not save book' });
  }
});

app.put('/api/books/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateBook(req.params.id, req.body);
    return res.json({ success: true, book: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Could not update book' });
  }
});

app.delete('/api/books/:id', (req: Request, res: Response) => {
  try {
    const deleted = db.deleteBook(req.params.id);
    return res.json({ success: true, message: `Book ${deleted.title} (${deleted.book_id}) removed.`, book: deleted });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Could not delete book' });
  }
});

// -------------------------------------------------------------
// ISSUE MODULE REST APIS
// -------------------------------------------------------------
app.get('/api/issues/check-eligibility', (req: Request, res: Response) => {
  try {
    const studentId = req.query.student_id ? String(req.query.student_id) : '';
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID query parameter is required' });
    }
    const eligibility = db.checkStudentEligibility(studentId);
    return res.json(eligibility);
  } catch (err: any) {
    return res.status(404).json({ error: err.message || 'Student not found' });
  }
});

app.get('/api/issues', (req: Request, res: Response) => {
  try {
    const { status, student_id, q } = req.query;
    const issues = db.getIssues({
      status: status ? String(status) : undefined,
      student_id: student_id ? String(student_id) : undefined,
      q: q ? String(q) : undefined
    });
    return res.json(issues);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch issues' });
  }
});

app.post('/api/issues', (req: Request, res: Response) => {
  try {
    const { student_id, book_id, copy_barcode, loan_days, issued_by, remarks } = req.body;
    if (!student_id || !book_id) {
      return res.status(400).json({ error: 'Student ID and Book ID are required to issue a book.' });
    }

    const result = db.issueBook({
      student_id,
      book_id,
      copy_barcode,
      loan_days: loan_days ? Number(loan_days) : undefined,
      issued_by,
      remarks
    });

    return res.status(201).json({
      success: true,
      message: `Book "${result.book.title}" issued to ${result.student.name} successfully.`,
      ...result
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to issue book' });
  }
});

// -------------------------------------------------------------
// RETURN MODULE REST APIS
// -------------------------------------------------------------
app.get('/api/returns/lookup', (req: Request, res: Response) => {
  try {
    const q = req.query.q ? String(req.query.q) : '';
    if (!q) {
      return res.json([]);
    }
    const results = db.lookupReturnTarget(q);
    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to lookup return items' });
  }
});

app.get('/api/returns', (_req: Request, res: Response) => {
  try {
    const returns = db.getReturns();
    return res.json(returns);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch returns' });
  }
});

app.post('/api/returns', (req: Request, res: Response) => {
  try {
    const { issue_id, return_date, condition_notes, fine_status, payment_method, transaction_ref, received_by } = req.body;
    if (!issue_id) {
      return res.status(400).json({ error: 'Issue ID is required to process return' });
    }

    const result = db.processReturn({
      issue_id,
      return_date,
      condition_notes,
      fine_status: fine_status || 'none',
      payment_method,
      transaction_ref,
      received_by
    });

    return res.json({
      success: true,
      message: `Book "${result.book?.title}" marked as returned successfully.`,
      ...result
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Return processing failed' });
  }
});

// -------------------------------------------------------------
// STUDENT MANAGEMENT REST APIS
// -------------------------------------------------------------
app.get('/api/students', (req: Request, res: Response) => {
  try {
    const { q, department } = req.query;
    const students = db.getStudents({
      q: q ? String(q) : undefined,
      department: department ? String(department) : undefined
    });
    return res.json(students);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch students' });
  }
});

app.get('/api/students/:id/history', (req: Request, res: Response) => {
  try {
    const history = db.getStudentHistory(req.params.id);
    if (!history) {
      return res.status(404).json({ error: `Student ${req.params.id} not found` });
    }
    return res.json(history);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch student history' });
  }
});

app.post('/api/students', (req: Request, res: Response) => {
  try {
    const { student_id, name, email, phone, department, course, semester, max_borrow_limit } = req.body;
    if (!student_id || !name || !email || !department || !course || !semester) {
      return res.status(400).json({ error: 'Student ID, Name, Email, Department, Course, and Semester are required.' });
    }

    const student = db.addStudent({
      student_id,
      name,
      email,
      phone: phone || '',
      department,
      course,
      semester,
      max_borrow_limit: Number(max_borrow_limit) || 3
    });

    return res.status(201).json({ success: true, student });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Could not add student' });
  }
});

app.put('/api/students/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateStudent(req.params.id, req.body);
    return res.json({ success: true, student: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Could not update student' });
  }
});

app.delete('/api/students/:id', (req: Request, res: Response) => {
  try {
    const deleted = db.deleteStudent(req.params.id);
    return res.json({ success: true, message: `Student ${deleted.name} (${deleted.student_id}) removed.`, student: deleted });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Could not delete student' });
  }
});

// -------------------------------------------------------------
// REPORTS REST APIS
// -------------------------------------------------------------
app.get('/api/reports/:type', (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { date } = req.query;
    const report = db.getReports(type, date ? String(date) : undefined);
    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate report' });
  }
});

// -------------------------------------------------------------
// SETTINGS & DATABASE RESET APIS
// -------------------------------------------------------------
app.get('/api/settings', (_req: Request, res: Response) => {
  try {
    return res.json(db.getSettings());
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    return res.json({ success: true, settings: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/api/database/reset', (_req: Request, res: Response) => {
  try {
    db.resetToSample();
    return res.json({ success: true, message: 'Database reset to initial college sample records.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
