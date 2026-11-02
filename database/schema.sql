-- ==============================================================================
-- College Library Management System (LMS)
-- Target Database: MySQL 8.0+
-- File: schema.sql
-- Description: Complete schema with constraints, foreign keys, and sample data.
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `athena_library_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `athena_library_db`;

-- Drop existing tables if re-initializing
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `fine_payments`;
DROP TABLE IF EXISTS `book_returns`;
DROP TABLE IF EXISTS `book_issues`;
DROP TABLE IF EXISTS `book_copies`;
DROP TABLE IF EXISTS `books`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `system_settings`;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------------------
-- 1. System Settings & Policies
-- ------------------------------------------------------------------------------
CREATE TABLE `system_settings` (
  `setting_key` VARCHAR(50) NOT NULL PRIMARY KEY,
  `setting_value` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`) VALUES
('fine_rate_per_day', '5.00', 'Fine amount charged per day overdue in Indian Rupees (₹)'),
('default_loan_duration_days', '14', 'Standard issue period for students'),
('max_books_per_student', '3', 'Maximum active books allowed per student'),
('library_name', 'Athena Central College Library', 'Institution Name'),
('librarian_email', 'library@athena.college.edu', 'Contact desk email');

-- ------------------------------------------------------------------------------
-- 2. Users (Authentication & Staff)
-- ------------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'librarian', 'student') NOT NULL DEFAULT 'student',
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(20) DEFAULT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 3. Students Table
-- ------------------------------------------------------------------------------
CREATE TABLE `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NOT NULL,
  `department` VARCHAR(100) NOT NULL,
  `course` VARCHAR(50) NOT NULL,
  `semester` VARCHAR(20) NOT NULL,
  `max_borrow_limit` INT NOT NULL DEFAULT 3,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_students_department` (`department`),
  INDEX `idx_students_student_id` (`student_id`)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 4. Categories Table
-- ------------------------------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL
) ENGINE=InnoDB;

INSERT INTO `categories` (`code`, `name`, `description`) VALUES
('CS', 'Computer Science & IT', 'Programming, Data Structures, Algorithms, AI, Web Development'),
('ECE', 'Electronics & Communication', 'Circuits, Microprocessors, Signals, Telecommunication'),
('MECH', 'Mechanical Engineering', 'Thermodynamics, Fluid Mechanics, Kinematics, CAD'),
('MATH', 'Mathematics & Statistics', 'Calculus, Linear Algebra, Discrete Math, Statistics'),
('MGMT', 'Management & Business', 'Marketing, Finance, Operations, Strategy'),
('LIT', 'Literature & Humanities', 'Fiction, English Literature, Academic Writing, Philosophy');

-- ------------------------------------------------------------------------------
-- 5. Books Master Table
-- ------------------------------------------------------------------------------
CREATE TABLE `books` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `book_id` VARCHAR(30) NOT NULL UNIQUE,
  `isbn` VARCHAR(20) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(150) NOT NULL,
  `publisher` VARCHAR(150) NOT NULL,
  `category_id` INT DEFAULT NULL,
  `category` VARCHAR(100) NOT NULL,
  `publication_year` INT NOT NULL,
  `total_quantity` INT NOT NULL DEFAULT 1,
  `available_quantity` INT NOT NULL DEFAULT 1,
  `shelf_location` VARCHAR(50) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `cover_url` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  INDEX `idx_books_title` (`title`),
  INDEX `idx_books_author` (`author`),
  INDEX `idx_books_category` (`category`),
  INDEX `idx_books_shelf` (`shelf_location`),
  CONSTRAINT `chk_available_qty` CHECK (`available_quantity` >= 0 AND `available_quantity` <= `total_quantity`)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 6. Book Copies Table (Individual physical barcodes)
-- ------------------------------------------------------------------------------
CREATE TABLE `book_copies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `book_id` INT NOT NULL,
  `copy_number` INT NOT NULL,
  `barcode` VARCHAR(50) NOT NULL UNIQUE,
  `status` ENUM('available', 'issued', 'maintenance', 'lost') NOT NULL DEFAULT 'available',
  `condition_state` ENUM('new', 'good', 'fair', 'damaged') NOT NULL DEFAULT 'good',
  `shelf_location` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uniq_book_copy` (`book_id`, `copy_number`)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 7. Book Issues Table
-- ------------------------------------------------------------------------------
CREATE TABLE `book_issues` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `issue_id` VARCHAR(30) NOT NULL UNIQUE,
  `student_id` VARCHAR(30) NOT NULL,
  `book_id` VARCHAR(30) NOT NULL,
  `copy_id` INT DEFAULT NULL,
  `issue_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `return_date` DATE DEFAULT NULL,
  `status` ENUM('issued', 'returned', 'overdue') NOT NULL DEFAULT 'issued',
  `issued_by` VARCHAR(100) DEFAULT 'Librarian Desk',
  `remarks` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON DELETE RESTRICT,
  FOREIGN KEY (`book_id`) REFERENCES `books`(`book_id`) ON DELETE RESTRICT,
  INDEX `idx_issues_status` (`status`),
  INDEX `idx_issues_due_date` (`due_date`)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 8. Book Returns Table
-- ------------------------------------------------------------------------------
CREATE TABLE `book_returns` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `return_id` VARCHAR(30) NOT NULL UNIQUE,
  `issue_id` VARCHAR(30) NOT NULL,
  `student_id` VARCHAR(30) NOT NULL,
  `book_id` VARCHAR(30) NOT NULL,
  `return_date` DATE NOT NULL,
  `overdue_days` INT NOT NULL DEFAULT 0,
  `fine_rate` DECIMAL(8,2) NOT NULL DEFAULT 5.00,
  `fine_amount` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `fine_status` ENUM('none', 'paid', 'pending', 'waived') NOT NULL DEFAULT 'none',
  `received_by` VARCHAR(100) DEFAULT 'Librarian Desk',
  `condition_notes` VARCHAR(255) DEFAULT 'Good condition',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`issue_id`) REFERENCES `book_issues`(`issue_id`) ON DELETE RESTRICT,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON DELETE RESTRICT,
  FOREIGN KEY (`book_id`) REFERENCES `books`(`book_id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 9. Fine Payments Table
-- ------------------------------------------------------------------------------
CREATE TABLE `fine_payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `receipt_no` VARCHAR(40) NOT NULL UNIQUE,
  `return_id` VARCHAR(30) NOT NULL,
  `student_id` VARCHAR(30) NOT NULL,
  `amount` DECIMAL(8,2) NOT NULL,
  `payment_method` ENUM('cash', 'upi', 'card', 'waived') NOT NULL DEFAULT 'cash',
  `transaction_ref` VARCHAR(100) DEFAULT NULL,
  `paid_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`return_id`) REFERENCES `book_returns`(`return_id`) ON DELETE RESTRICT,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ==============================================================================
-- Triggers for MySQL Integrity
-- ==============================================================================
DELIMITER $$

-- Decrement available copies on issue
CREATE TRIGGER `trg_after_issue_insert`
AFTER INSERT ON `book_issues`
FOR EACH ROW
BEGIN
  IF NEW.status = 'issued' THEN
    UPDATE `books`
    SET `available_quantity` = `available_quantity` - 1
    WHERE `book_id` = NEW.book_id AND `available_quantity` > 0;
    
    IF NEW.copy_id IS NOT NULL THEN
      UPDATE `book_copies`
      SET `status` = 'issued'
      WHERE `id` = NEW.copy_id;
    END IF;
  END IF;
END$$

-- Increment available copies on return
CREATE TRIGGER `trg_after_return_insert`
AFTER INSERT ON `book_returns`
FOR EACH ROW
BEGIN
  UPDATE `books`
  SET `available_quantity` = LEAST(`total_quantity`, `available_quantity` + 1)
  WHERE `book_id` = NEW.book_id;

  UPDATE `book_issues`
  SET `status` = 'returned', `return_date` = NEW.return_date
  WHERE `issue_id` = NEW.issue_id;
END$$

DELIMITER ;

-- ==============================================================================
-- Sample Seeding
-- ==============================================================================
INSERT INTO `users` (`username`, `password_hash`, `full_name`, `role`, `email`, `phone`) VALUES
('admin', '$2b$10$demoHashedPasswordAdmin123', 'Prof. Arvind Sharma', 'admin', 'admin@athena.college.edu', '+91 98765 43210'),
('librarian', '$2b$10$demoHashedPasswordLib123', 'Ms. Sunita Roy', 'librarian', 'librarian@athena.college.edu', '+91 98765 12345'),
('student', '$2b$10$demoHashedPasswordStu123', 'Aarav Patel', 'student', 'aarav.p@student.athena.edu', '+91 91234 56789');

INSERT INTO `students` (`student_id`, `name`, `email`, `phone`, `department`, `course`, `semester`, `max_borrow_limit`) VALUES
('STU-2024-001', 'Aarav Patel', 'aarav.p@student.athena.edu', '+91 91234 56789', 'Computer Science & Eng', 'B.Tech CSE', '6th Semester', 3),
('STU-2024-002', 'Priya Sharma', 'priya.s@student.athena.edu', '+91 98345 67890', 'Computer Science & Eng', 'B.Tech CSE', '4th Semester', 3),
('STU-2024-003', 'Rohan Verma', 'rohan.v@student.athena.edu', '+91 97456 12389', 'Electronics & Comm', 'B.Tech ECE', '8th Semester', 3),
('STU-2024-004', 'Ananya Iyer', 'ananya.i@student.athena.edu', '+91 99123 45678', 'Management Studies', 'MBA', '2nd Semester', 3),
('STU-2024-005', 'Vikramaditya Rao', 'vikram.r@student.athena.edu', '+91 98567 89012', 'Mechanical Eng', 'B.Tech MECH', '5th Semester', 3),
('STU-2024-006', 'Sneha Kulkarni', 'sneha.k@student.athena.edu', '+91 94231 67895', 'Applied Sciences', 'B.Sc Mathematics', '3rd Semester', 3);

INSERT INTO `books` (`book_id`, `isbn`, `title`, `author`, `publisher`, `category_id`, `category`, `publication_year`, `total_quantity`, `available_quantity`, `shelf_location`, `description`) VALUES
('BK-1001', '978-0131103627', 'The C Programming Language', 'Brian W. Kernighan, Dennis M. Ritchie', 'Prentice Hall', 1, 'Computer Science & IT', 1988, 5, 4, 'Rack A-12', 'The authoritative guide to ANSI standard C programming.'),
('BK-1002', '978-0262033848', 'Introduction to Algorithms (CLRS)', 'Thomas H. Cormen, Charles E. Leiserson', 'MIT Press', 1, 'Computer Science & IT', 2009, 6, 4, 'Rack A-14', 'Comprehensive standard textbook on modern computer algorithms.'),
('BK-1003', '978-0132350884', 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 'Pearson', 1, 'Computer Science & IT', 2008, 4, 3, 'Rack A-15', 'Essential rules and principles for writing readable and maintainable software.'),
('BK-1004', '978-0134494166', 'Operating Systems: Three Easy Pieces', 'Remzi H. Arpaci-Dusseau', 'CreateSpace', 1, 'Computer Science & IT', 2018, 4, 3, 'Rack B-03', 'Core mechanisms of virtualization, concurrency, and persistence.'),
('BK-1005', '978-0132143011', 'Computer Networks: A Systems Approach', 'Larry L. Peterson, Bruce S. Davie', 'Morgan Kaufmann', 1, 'Computer Science & IT', 2011, 4, 4, 'Rack B-07', 'In-depth perspective on modern packet networking architectures.'),
('BK-1006', '978-0199339136', 'Microelectronic Circuits', 'Adel S. Sedra, Kenneth C. Smith', 'Oxford University Press', 2, 'Electronics & Communication', 2014, 5, 4, 'Rack C-02', 'Foundational textbook on analog and digital electronic circuits.'),
('BK-1007', '978-0073380377', 'Vector Mechanics for Engineers: Statics & Dynamics', 'Ferdinand P. Beer, E. Russell Johnston', 'McGraw-Hill', 3, 'Mechanical Engineering', 2015, 4, 3, 'Rack D-01', 'Classical mechanics and vector kinematics for engineering students.'),
('BK-1008', '978-0134674483', 'Linear Algebra and Its Applications', 'David C. Lay, Steven R. Lay', 'Pearson', 4, 'Mathematics & Statistics', 2016, 5, 5, 'Rack E-04', 'Concrete introduction to vectors, matrices, eigenvalues, and linear spaces.'),
('BK-1009', '978-0078024078', 'Strategic Management: Concepts and Cases', 'Frank T. Rothaermel', 'McGraw-Hill Education', 5, 'Management & Business', 2020, 3, 2, 'Rack F-02', 'Frameworks for competitive strategy and business leadership.'),
('BK-1010', '978-0143105954', 'The Republic', 'Plato', 'Penguin Classics', 6, 'Literature & Humanities', 2007, 3, 3, 'Rack G-05', 'Philosophical dialogue on justice, political order, and education.');
