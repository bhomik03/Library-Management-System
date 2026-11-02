import React, { useState } from 'react';
import {
  Book,
  BookCopy
} from '../../types/library';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Layers,
  BookDown,
  X,
  AlertCircle,
  CheckCircle2,
  Barcode
} from 'lucide-react';
import { useToast } from '../common/Toast';
import { api } from '../../services/api';

interface BookManagementViewProps {
  books: Book[];
  onRefresh: () => void;
  onInitiateIssue?: (bookId: string) => void;
}

const CATEGORIES = [
  'All',
  'Computer Science & IT',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Mathematics & Statistics',
  'Management & Business',
  'Literature & Humanities'
];

export const BookManagementView: React.FC<BookManagementViewProps> = ({
  books,
  onRefresh,
  onInitiateIssue
}) => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'out_of_stock'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [selectedCopiesBook, setSelectedCopiesBook] = useState<Book | null>(null);
  const [deleteConfirmBook, setDeleteConfirmBook] = useState<Book | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    book_id: '',
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    category: 'Computer Science & IT',
    publication_year: new Date().getFullYear(),
    total_quantity: 3,
    shelf_location: 'Rack A-01',
    description: ''
  });

  const handleOpenAddModal = () => {
    setFormData({
      book_id: '',
      isbn: '',
      title: '',
      author: '',
      publisher: '',
      category: 'Computer Science & IT',
      publication_year: new Date().getFullYear(),
      total_quantity: 3,
      shelf_location: 'Rack A-01',
      description: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({
      book_id: book.book_id,
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      category: book.category,
      publication_year: book.publication_year,
      total_quantity: book.total_quantity,
      shelf_location: book.shelf_location,
      description: book.description || ''
    });
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.isbn || !formData.shelf_location) {
      showToast('Validation Error', 'Please complete all required fields.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingBook) {
        await api.updateBook(editingBook.book_id, {
          title: formData.title,
          author: formData.author,
          publisher: formData.publisher,
          category: formData.category,
          publication_year: Number(formData.publication_year),
          total_quantity: Number(formData.total_quantity),
          shelf_location: formData.shelf_location,
          description: formData.description,
          isbn: formData.isbn
        });
        showToast('Book Updated', `"${formData.title}" updated successfully.`, 'success');
        setEditingBook(null);
      } else {
        await api.addBook({
          book_id: formData.book_id ? formData.book_id.trim() : undefined,
          isbn: formData.isbn,
          title: formData.title,
          author: formData.author,
          publisher: formData.publisher,
          category: formData.category,
          publication_year: Number(formData.publication_year),
          total_quantity: Number(formData.total_quantity),
          shelf_location: formData.shelf_location,
          description: formData.description
        });
        showToast('Book Added', `"${formData.title}" added to library catalog.`, 'success');
        setIsAddModalOpen(false);
      }
      onRefresh();
    } catch (err: any) {
      showToast('Operation Failed', err.message || 'Could not save book record', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!deleteConfirmBook) return;
    try {
      setIsSubmitting(true);
      await api.deleteBook(deleteConfirmBook.book_id);
      showToast('Book Removed', `"${deleteConfirmBook.title}" removed from catalog.`, 'success');
      setDeleteConfirmBook(null);
      onRefresh();
    } catch (err: any) {
      showToast('Deletion Blocked', err.message || 'Could not delete book', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCopiesDrawer = async (book: Book) => {
    try {
      const detailed = await api.getBookById(book.book_id);
      setSelectedCopiesBook(detailed);
    } catch (err) {
      setSelectedCopiesBook(book);
    }
  };

  // Filtered books
  const filteredBooks = books.filter(book => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.book_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.shelf_location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;

    let matchesAvail = true;
    if (availabilityFilter === 'available') {
      matchesAvail = book.available_quantity > 0;
    } else if (availabilityFilter === 'out_of_stock') {
      matchesAvail = book.available_quantity === 0;
    }

    return matchesSearch && matchesCategory && matchesAvail;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Book Master Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {books.length} titles registered in library system
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, author, ISBN, book ID, or shelf rack..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-56 shrink-0">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setAvailabilityFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                availabilityFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({books.length})
            </button>
            <button
              onClick={() => setAvailabilityFilter('available')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                availabilityFilter === 'available'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Available ({books.filter(b => b.available_quantity > 0).length})
            </button>
            <button
              onClick={() => setAvailabilityFilter('out_of_stock')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                availabilityFilter === 'out_of_stock'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Out of Stock ({books.filter(b => b.available_quantity === 0).length})
            </button>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Book Code / ISBN</th>
                <th className="py-3 px-4">Title & Author</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Shelf Rack</th>
                <th className="py-3 px-4 text-center">Copies (Avail / Total)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No books match your current filter parameters.
                  </td>
                </tr>
              ) : (
                filteredBooks.map(book => {
                  const isAvailable = book.available_quantity > 0;
                  return (
                    <tr
                      key={book.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Book ID & ISBN */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-semibold text-slate-800 block">
                          {book.book_id}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                          {book.isbn}
                        </span>
                      </td>

                      {/* Title & Author */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-semibold text-slate-900 line-clamp-1">{book.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {book.author} · {book.publisher} ({book.publication_year})
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-slate-600 font-medium">{book.category}</span>
                      </td>

                      {/* Shelf Rack */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {book.shelf_location}
                        </span>
                      </td>

                      {/* Copies & Availability */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                          <span
                            className={`font-bold ${
                              isAvailable ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {book.available_quantity}
                          </span>
                          <span className="text-slate-400">/</span>
                          <span className="text-slate-600">{book.total_quantity}</span>
                        </div>
                        <span
                          className={`block text-[10px] font-medium mt-0.5 ${
                            isAvailable ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {isAvailable ? 'In Stock' : 'Issued Out'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {onInitiateIssue && (
                            <button
                              onClick={() => onInitiateIssue(book.book_id)}
                              disabled={!isAvailable}
                              title="Issue this book to a student"
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              <BookDown className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenCopiesDrawer(book)}
                            title="Manage physical copies & barcodes"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(book)}
                            title="Edit book details"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmBook(book)}
                            title="Delete book"
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

      {/* Add / Edit Book Modal */}
      {(isAddModalOpen || editingBook) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-sm">
                {editingBook ? `Edit Book: ${editingBook.book_id}` : 'Add New Book to Catalog'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingBook(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Book ID (Code)</label>
                  <input
                    type="text"
                    placeholder="e.g. BK-1011 (Auto-generated if empty)"
                    value={formData.book_id}
                    onChange={e => setFormData({ ...formData, book_id: e.target.value })}
                    disabled={!!editingBook}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    ISBN Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 978-0131103627"
                    value={formData.isbn}
                    onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Book Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems: Three Easy Pieces"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Author(s) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brian W. Kernighan"
                    value={formData.author}
                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Publisher</label>
                  <input
                    type="text"
                    placeholder="e.g. Prentice Hall / MIT Press"
                    value={formData.publisher}
                    onChange={e => setFormData({ ...formData, publisher: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Publication Year</label>
                  <input
                    type="number"
                    min="1800"
                    max="2099"
                    value={formData.publication_year}
                    onChange={e => setFormData({ ...formData, publication_year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Total Copies (Quantity) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.total_quantity}
                    onChange={e => setFormData({ ...formData, total_quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Shelf Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rack A-12 / Floor 2"
                    value={formData.shelf_location}
                    onChange={e => setFormData({ ...formData, shelf_location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description / Summary</label>
                <textarea
                  rows={2}
                  placeholder="Academic syllabus coverage, edition details..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingBook(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingBook ? 'Update Book Record' : 'Save New Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Copies & Barcodes Drawer */}
      {selectedCopiesBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-sm">
                  Physical Copies & Barcodes: {selectedCopiesBook.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCopiesBook(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Book Code: {selectedCopiesBook.book_id}</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedCopiesBook.title}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[11px]">Inventory</span>
                  <span className="font-mono font-semibold text-slate-900 text-sm">
                    {selectedCopiesBook.available_quantity} Avail / {selectedCopiesBook.total_quantity} Total
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-800 text-xs">Individual Copy Units</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {selectedCopiesBook.copies && selectedCopiesBook.copies.length > 0 ? (
                    selectedCopiesBook.copies.map(c => (
                      <div
                        key={c.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-700">
                            #{c.copy_number}
                          </div>
                          <div>
                            <span className="font-mono font-semibold text-slate-900 block">
                              {c.barcode}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              Rack: {c.shelf_location || selectedCopiesBook.shelf_location} · Condition: {c.condition_state}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                              c.status === 'available'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'issued'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-400">
                      No physical copies registered for this book yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedCopiesBook(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Remove Book from Catalog?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>"{deleteConfirmBook.title}"</strong> ({deleteConfirmBook.book_id})?
              </p>
              <p className="text-[11px] text-slate-400 mt-2 bg-slate-50 p-2 rounded">
                Note: Books with active student loans cannot be deleted until all copies are returned.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmBook(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBook}
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
