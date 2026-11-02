# Athena College Library Management System (LMS)

A modern, professional, fully functional **Library Management System** built for college and university libraries. Designed with a clean academic visual theme (deep navy and crisp white), responsive layouts, role-based workflows for Administrators, Librarians, and Students, transactional book loans and returns, automated overdue fine calculation, and institutional reporting.

---

## 1. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons
- **Backend**: Node.js & Express.js REST API
- **Database**:
  - Production DDL Schema: MySQL 8.0+ (`/database/schema.sql` with tables, foreign keys, triggers, constraints, and sample data)
  - Runtime Store: Embedded persistent transactional JSON engine (`/server/db.ts` / `/data/library_db.json`)
- **API Architecture**: Clean RESTful endpoints for Books, Copies, Issues, Returns, Students, Reports, and System Settings.

---

## 2. Core Modules & Features

### Dashboard
- **Live KPIs**: Total Catalog Volume, Available Copies on Shelf, Active Student Loans, Registered Students, Overdue Books, and Fines Collected.
- **Activity Feed**: Real-time log of recent issue and return transactions.
- **Departmental Stock Breakdown**: Progress tracking by academic categories.
- **Quick Action Bar**: Shortcuts to Issue Book, Return Book, and Add Book.

### Book Management
- Full CRUD: Add, edit, delete, and browse books.
- Fields: Book ID, ISBN, Title, Author, Publisher, Category, Publication Year, Total Quantity, Available Quantity, Shelf Location, and Description.
- **Physical Copy Inventory**: Manage individual physical barcodes (e.g. `BK-1001-C01`) and monitor unit status (`available`, `issued`, `maintenance`, `lost`).
- Safe deletion validation preventing removal of books with active student loans.

### Book Search
- Instant multi-field search across:
  - Book Title
  - Author Name
  - ISBN
  - Category
  - Book ID (Code)
  - Shelf Location
- Filters for Available Books, Issued Books, and academic departments.
- One-click shortcut to issue selected book to a student.

### Book Issue System
- **Student Authorization**: Real-time student lookup with active loan counter and max limit enforcement (default 3 books).
- **Overdue Check**: Blocks new issues if the student has overdue books requiring return.
- **Stock Validation**: Automatically prevents issuing out-of-stock titles.
- **Automated Due Date**: Automatically computes due date (default 14 days).

### Book Return & Fine Calculation System
- Quick search by Student ID, Book ID, or Issue ID.
- **Automated Overdue Computation**: Calculates exact calendar overdue days.
- **Configurable Fine Rate**: Calculates overdue fine at ₹5/day (default, configurable by Admin).
- **Settlement Modes**: Fine Paid (Cash/UPI/Card), Fine Pending, or Admin-Waived.
- **Receipt Generator**: Generates an official printable return acknowledgement slip.

### Student Management
- Directory with search, department filtering, and pagination.
- Add, edit, and delete student records.
- **Borrowing Transcript Drawer**: Detailed lifetime audit of active loans, returned books, and fine payment history.

### Institutional Reports
- **Daily Book Issue Report**: Filtered by date with recipient student information.
- **Daily Book Return Report**: Filtered by return date with condition notes.
- **Overdue Books Report**: Active overdue loans with student email/phone contact and computed fine.
- **Fine Collection Ledger**: Transaction list with payment modes (UPI, Cash, Card) and receipt numbers.
- **Most Borrowed Books**: Frequency ranking of top checked-out titles.
- **Export Capabilities**: 1-click **Export as CSV** and **Print / Save as PDF**.

### System Settings & Policies
- Configurable overdue fine rate per day (₹).
- Configurable standard loan duration (days).
- Maximum borrowing limit per student.
- Demo database reset with 1-click restoration.

---

## 3. Database Architecture (MySQL)

The complete SQL schema is defined in `/database/schema.sql`:

1. `users`: System login accounts and RBAC (`admin`, `librarian`, `student`).
2. `students`: Enrolled student profiles, courses, departments, and semesters.
3. `categories`: Academic branches (Computer Science, ECE, Mechanical, Mathematics, Management, Literature).
4. `books`: Catalog master table with ISBN, title, shelf location, and quantities.
5. `book_copies`: Individual physical barcode units per book.
6. `book_issues`: Loan transaction records with issue and due dates.
7. `book_returns`: Check-in receipts with overdue days and fines.
8. `fine_payments`: Payment logs with transaction references.
9. `system_settings`: Key-value configuration parameters.

To initialize MySQL locally:
```bash
mysql -u root -p < database/schema.sql
```

---

## 4. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user (Admin/Librarian/Student) |
| `GET` | `/api/dashboard/stats` | Retrieve live circulation KPIs & activities |
| `GET` | `/api/books` | List books with search & category filters |
| `POST` | `/api/books` | Register new book & generate physical copies |
| `PUT` | `/api/books/:id` | Update book metadata & shelf location |
| `DELETE` | `/api/books/:id` | Delete book (safe check on active loans) |
| `GET` | `/api/issues` | List active & overdue issues |
| `GET` | `/api/issues/check-eligibility` | Verify student eligibility & loan limits |
| `POST` | `/api/issues` | Issue a book to a student |
| `GET` | `/api/returns/lookup` | Search unreturned loan by student/book ID |
| `POST` | `/api/returns` | Process book return & compute fine |
| `GET` | `/api/students` | List registered students |
| `GET` | `/api/students/:id/history` | Full student borrowing transcript |
| `POST` | `/api/students` | Register new student |
| `PUT` | `/api/students/:id` | Update student profile |
| `DELETE` | `/api/students/:id` | Delete student |
| `GET` | `/api/reports/:type` | Fetch daily issues, returns, overdue, fines |
| `GET` | `/api/settings` | Get circulation settings & fine rates |
| `PUT` | `/api/settings` | Update settings (Admin) |
| `POST` | `/api/database/reset` | Reset to sample records |

---

## 5. Local Setup & Installation Instructions

### Prerequisites
- Node.js (v18 or v20+)
- npm or yarn

### Steps to Run
1. Clone the repository and install dependencies:
```bash
npm install
```

2. Start the development server (runs Express REST backend with integrated Vite on port 3000):
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

4. Pre-Configured Demo Accounts:
- **Admin**: Username: `admin` | Password: `admin123`
- **Librarian**: Username: `librarian` | Password: `lib123`
- **Student**: Username: `STU-2024-001` | Password: `student123`
*(You can also use the one-click portal switcher located at the top of the sidebar)*
