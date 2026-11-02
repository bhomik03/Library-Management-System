import React, { useState, useEffect } from 'react';
import { Student, BookIssue } from '../../types/library';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  History,
  AlertCircle,
  X,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Phone,
  Mail
} from 'lucide-react';
import { useToast } from '../common/Toast';
import { api } from '../../services/api';

interface StudentManagementViewProps {
  onInitiateIssueToStudent?: (studentId: string) => void;
}

const DEPARTMENTS = [
  'All Departments',
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Management Studies',
  'Applied Sciences'
];

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  onInitiateIssueToStudent
}) => {
  const { showToast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [historyStudentId, setHistoryStudentId] = useState<string | null>(null);
  const [studentHistory, setStudentHistory] = useState<{
    student: Student;
    activeIssues: BookIssue[];
    returnedIssues: BookIssue[];
    totalBorrowed: number;
    finePaidTotal: number;
  } | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CSE',
    semester: '1st Semester',
    max_borrow_limit: 3
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await api.getStudents({
        q: searchQuery || undefined,
        department: selectedDept !== 'All Departments' ? selectedDept : undefined
      });
      setStudents(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchQuery, selectedDept]);

  const handleOpenAddModal = () => {
    const nextNum = 100 + students.length + 1;
    setFormData({
      student_id: `STU-2024-${nextNum}`,
      name: '',
      email: '',
      phone: '+91 ',
      department: 'Computer Science & Engineering',
      course: 'B.Tech CSE',
      semester: '1st Semester',
      max_borrow_limit: 3
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      student_id: student.student_id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      department: student.department,
      course: student.course,
      semester: student.semester,
      max_borrow_limit: student.max_borrow_limit
    });
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id || !formData.name || !formData.email || !formData.department) {
      showToast('Validation Error', 'Please complete all required fields.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingStudent) {
        await api.updateStudent(editingStudent.student_id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          course: formData.course,
          semester: formData.semester,
          max_borrow_limit: Number(formData.max_borrow_limit)
        });
        showToast('Student Updated', `${formData.name} record updated.`, 'success');
        setEditingStudent(null);
      } else {
        await api.addStudent({
          student_id: formData.student_id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          course: formData.course,
          semester: formData.semester,
          max_borrow_limit: Number(formData.max_borrow_limit)
        });
        showToast('Student Registered', `${formData.name} added to library database.`, 'success');
        setIsAddModalOpen(false);
      }
      fetchStudents();
    } catch (err: any) {
      showToast('Operation Failed', err.message || 'Could not save student record', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteConfirmStudent) return;
    try {
      setIsSubmitting(true);
      await api.deleteStudent(deleteConfirmStudent.student_id);
      showToast('Student Removed', `${deleteConfirmStudent.name} deleted from system.`, 'success');
      setDeleteConfirmStudent(null);
      fetchStudents();
    } catch (err: any) {
      showToast('Deletion Blocked', err.message || 'Could not delete student', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewHistory = async (studentId: string) => {
    setHistoryStudentId(studentId);
    try {
      setLoadingHistory(true);
      const data = await api.getStudentHistory(studentId);
      setStudentHistory(data);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to load borrowing history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Student Directory & Borrowers</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered college students, current loan quotas, and historical borrowing transcripts
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, ID (e.g. STU-2024-001), email, or course..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="w-full md:w-64 shrink-0">
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Student Name & Contact</th>
                <th className="py-3 px-4">Department & Course</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4 text-center">Active Loans</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                students.map(student => {
                  const activeCount = student.activeLoansCount || 0;
                  const hasOverdue = (student.overdueCount || 0) > 0;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 block">
                          {student.student_id}
                        </span>
                        <span className="text-[10px] text-slate-400">Enrolled 2024</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{student.name}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {student.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {student.phone}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-800 block">
                          {student.department}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {student.course}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                          {student.semester}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-mono tabular-nums font-bold text-slate-800">
                          {activeCount} / {student.max_borrow_limit}
                        </span>
                        {hasOverdue && (
                          <span className="block text-[10px] text-red-600 font-semibold mt-0.5">
                            Overdue!
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleViewHistory(student.student_id)}
                            title="View student borrowing history"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(student)}
                            title="Edit student"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmStudent(student)}
                            title="Delete student"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {(isAddModalOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-sm">
                {editingStudent ? `Edit Student: ${editingStudent.student_id}` : 'Enroll New Student'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingStudent}
                    placeholder="e.g. STU-2024-007"
                    value={formData.student_id}
                    onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Patel"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  {DEPARTMENTS.filter(d => d !== 'All Departments').map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Course / Degree</label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech CSE / MBA"
                    value={formData.course}
                    onChange={e => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={e => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <option key={n} value={`${n}th Semester`}>
                        {n}th Semester
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Max Borrowing Limit (Books)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.max_borrow_limit}
                  onChange={e => setFormData({ ...formData, max_borrow_limit: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  {isSubmitting ? 'Saving...' : editingStudent ? 'Update Details' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Borrowing History Drawer / Modal */}
      {historyStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-sm">
                  Borrowing History & Account Ledger: {studentHistory?.student.name || historyStudentId}
                </h3>
              </div>
              <button
                onClick={() => {
                  setHistoryStudentId(null);
                  setStudentHistory(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {loadingHistory || !studentHistory ? (
                <div className="py-12 text-center text-slate-400">Loading student history...</div>
              ) : (
                <>
                  {/* Summary Bar */}
                  <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Lifetime Loans</span>
                      <span className="font-mono font-bold text-slate-900 text-base">
                        {studentHistory.totalBorrowed}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Active Issues</span>
                      <span className="font-mono font-bold text-blue-600 text-base">
                        {studentHistory.activeIssues.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Returned Books</span>
                      <span className="font-mono font-bold text-emerald-600 text-base">
                        {studentHistory.returnedIssues.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Total Fines Paid</span>
                      <span className="font-mono font-bold text-slate-900 text-base">
                        ₹{studentHistory.finePaidTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Active Loans */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs mb-2">
                      Currently Issued Books ({studentHistory.activeIssues.length})
                    </h4>
                    {studentHistory.activeIssues.length === 0 ? (
                      <p className="text-slate-400 text-xs py-2">No active books currently borrowed.</p>
                    ) : (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                        {studentHistory.activeIssues.map(iss => (
                          <div key={iss.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                            <div>
                              <span className="font-mono text-[10px] text-blue-600 font-semibold block">
                                {iss.issue_id} · Barcode: {iss.copy_barcode || iss.book_id}
                              </span>
                              <h5 className="font-semibold text-slate-900 mt-0.5">{iss.book_title}</h5>
                              <p className="text-slate-500 text-[11px]">
                                Issued on {iss.issue_date} · Due by <strong className="text-slate-800">{iss.due_date}</strong>
                              </p>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                iss.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {iss.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Past Returned Books */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs mb-2">
                      Returned Book Archive ({studentHistory.returnedIssues.length})
                    </h4>
                    {studentHistory.returnedIssues.length === 0 ? (
                      <p className="text-slate-400 text-xs py-2">No past return records.</p>
                    ) : (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                        {studentHistory.returnedIssues.map(iss => (
                          <div key={iss.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                            <div>
                              <span className="font-mono text-[10px] text-slate-400 block">
                                {iss.issue_id} · {iss.book_id}
                              </span>
                              <h5 className="font-semibold text-slate-900 mt-0.5">{iss.book_title}</h5>
                              <p className="text-slate-500 text-[11px]">
                                Returned: <strong className="text-slate-700">{iss.return_date || 'Yes'}</strong> (Issued: {iss.issue_date})
                              </p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800">
                              Returned
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => {
                  setHistoryStudentId(null);
                  setStudentHistory(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Remove Student Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>"{deleteConfirmStudent.name}"</strong> ({deleteConfirmStudent.student_id})?
              </p>
              <p className="text-[11px] text-slate-400 mt-2 bg-slate-50 p-2 rounded">
                Students with active, unreturned books cannot be deleted until all loans are cleared.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmStudent(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
