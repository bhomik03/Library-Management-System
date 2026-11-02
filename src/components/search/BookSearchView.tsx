import React, { useState } from 'react';
import { Book } from '../../types/library';
import {
  Search,
  Filter,
  BookOpen,
  MapPin,
  CheckCircle2,
  XCircle,
  BookDown,
  Info,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BookSearchViewProps {
  books: Book[];
  onInitiateIssue?: (bookId: string) => void;
}

const CATEGORIES = [
  'All Categories',
  'Computer Science & IT',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Mathematics & Statistics',
  'Management & Business',
  'Literature & Humanities'
];

export const BookSearchView: React.FC<BookSearchViewProps> = ({
  books,
  onInitiateIssue
}) => {
  const { role } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [stockStatus, setStockStatus] = useState<'all' | 'available' | 'issued'>('all');
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<Book | null>(null);

  const filteredBooks = books.filter(b => {
    const q = query.toLowerCase().trim();
    const matchesQuery =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q) ||
      b.book_id.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.publisher.toLowerCase().includes(q) ||
      b.shelf_location.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === 'All Categories' || b.category === selectedCategory;

    let matchesStock = true;
    if (stockStatus === 'available') {
      matchesStock = b.available_quantity > 0;
    } else if (stockStatus === 'issued') {
      matchesStock = b.available_quantity < b.total_quantity;
    }

    return matchesQuery && matchesCategory && matchesStock;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Library Catalog Search</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Live repository lookup across all college disciplines and book stacks
        </p>
      </div>

      {/* Main Search Bar & Multi-filter */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-blue-600 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Title, Author, ISBN, Book ID (e.g. BK-1002), or Shelf Location..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setStockStatus('all')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                stockStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Books
            </button>
            <button
              onClick={() => setStockStatus('available')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                stockStatus === 'available'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Available Now
            </button>
            <button
              onClick={() => setStockStatus('issued')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                stockStatus === 'issued'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Currently Issued
            </button>
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            Found <strong className="text-slate-700">{filteredBooks.length}</strong> matching titles
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Book ID & ISBN</th>
                <th className="py-3 px-4">Book Title & Author</th>
                <th className="py-3 px-4">Department / Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Availability Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No books found matching "{query}". Try searching by another keyword.
                  </td>
                </tr>
              ) : (
                filteredBooks.map(book => {
                  const isAvailable = book.available_quantity > 0;
                  return (
                    <tr
                      key={book.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-semibold text-slate-900 block">
                          {book.book_id}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 block mt-0.5">
                          {book.isbn}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <button
                          onClick={() => setSelectedBookForDetails(book)}
                          className="font-semibold text-slate-900 hover:text-blue-600 text-left line-clamp-1 transition-colors"
                        >
                          {book.title}
                        </button>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          By {book.author} · {book.publisher}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {book.category}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{book.shelf_location}</span>
                        </div>
                      </td>

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
                          <span className="text-slate-600">{book.total_quantity} copies</span>
                        </div>
                        <span
                          className={`block text-[10px] font-medium mt-0.5 ${
                            isAvailable ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {isAvailable ? 'Available on Shelf' : 'All Copies Issued'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setSelectedBookForDetails(book)}
                            className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            Details
                          </button>
                          {(role === 'admin' || role === 'librarian') && onInitiateIssue && (
                            <button
                              onClick={() => onInitiateIssue(book.book_id)}
                              disabled={!isAvailable}
                              className="flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-md shadow-2xs transition-colors"
                            >
                              <BookDown className="w-3 h-3" />
                              Issue
                            </button>
                          )}
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

      {/* Book Details Modal */}
      {selectedBookForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-sm">Book Catalog Specifications</h3>
              </div>
              <button
                onClick={() => setSelectedBookForDetails(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="font-mono text-blue-600 font-semibold block text-[11px]">
                  {selectedBookForDetails.book_id} · ISBN {selectedBookForDetails.isbn}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedBookForDetails.title}
                </h3>
                <p className="text-slate-600 mt-0.5">
                  Author(s): <strong>{selectedBookForDetails.author}</strong>
                </p>
                <p className="text-slate-500">
                  Publisher: {selectedBookForDetails.publisher} ({selectedBookForDetails.publication_year})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block uppercase text-[10px]">Category</span>
                  <span className="font-semibold text-slate-800">{selectedBookForDetails.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[10px]">Shelf Rack</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedBookForDetails.shelf_location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[10px]">Total Copies</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedBookForDetails.total_quantity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[10px]">Available Copies</span>
                  <span className={`font-mono font-semibold ${selectedBookForDetails.available_quantity > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {selectedBookForDetails.available_quantity} on shelf
                  </span>
                </div>
              </div>

              {selectedBookForDetails.description && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Book Summary / Notes</h4>
                  <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    {selectedBookForDetails.description}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Library Location: Floor 2, Central Stacks
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedBookForDetails(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg"
                >
                  Close
                </button>
                {(role === 'admin' || role === 'librarian') && onInitiateIssue && (
                  <button
                    onClick={() => {
                      const id = selectedBookForDetails.book_id;
                      setSelectedBookForDetails(null);
                      onInitiateIssue(id);
                    }}
                    disabled={selectedBookForDetails.available_quantity <= 0}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg shadow-sm"
                  >
                    <BookDown className="w-3.5 h-3.5" />
                    Issue This Book
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
