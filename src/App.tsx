import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { BookManagementView } from './components/books/BookManagementView';
import { BookIssueView } from './components/issues/BookIssueView';
import { BookReturnView } from './components/returns/BookReturnView';
import { BookSearchView } from './components/search/BookSearchView';
import { StudentManagementView } from './components/students/StudentManagementView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { StudentPortalView } from './components/student-portal/StudentPortalView';
import { ReceiptModal } from './components/common/ReceiptModal';
import { Book, DashboardStats, ReturnReceipt } from './types/library';
import { api } from './services/api';

function MainLayout() {
  const { role } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Cross-module preselection parameters
  const [preselectedBookId, setPreselectedBookId] = useState<string | null>(null);
  const [preselectedIssueId, setPreselectedIssueId] = useState<string | null>(null);

  // Return receipt modal state
  const [activeReceipt, setActiveReceipt] = useState<ReturnReceipt | null>(null);

  // Global cache states
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchGlobalData = async () => {
    try {
      setIsRefreshing(true);
      const [statsData, booksData] = await Promise.all([
        api.getDashboardStats(),
        api.getBooks()
      ]);
      setStats(statsData);
      setBooks(booksData);
    } catch (err) {
      console.error('Failed to load global library data:', err);
    } finally {
      setLoadingStats(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  // Action shortcuts
  const handleInitiateIssue = (bookId: string) => {
    setPreselectedBookId(bookId);
    setCurrentTab('issue');
  };

  const handleInitiateReturn = (issueId: string) => {
    setPreselectedIssueId(issueId);
    setCurrentTab('return');
  };

  const handleOpenReceipt = (receipt: ReturnReceipt) => {
    setActiveReceipt(receipt);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        <Header
          currentTab={currentTab}
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onQuickIssue={() => setCurrentTab('issue')}
          onQuickSearch={() => setCurrentTab('search')}
          onRefreshData={fetchGlobalData}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 pb-16">
          {/* Dashboard Tab */}
          {currentTab === 'dashboard' && (
            role === 'student' ? (
              <StudentPortalView onSearchCatalog={() => setCurrentTab('search')} />
            ) : (
              <DashboardView
                stats={stats}
                loading={loadingStats}
                onNavigate={setCurrentTab}
                onQuickIssue={() => setCurrentTab('issue')}
                onQuickReturn={() => setCurrentTab('return')}
                onAddBook={() => setCurrentTab('books')}
              />
            )
          )}

          {/* Books Management Tab */}
          {currentTab === 'books' && (
            <BookManagementView
              books={books}
              onRefresh={fetchGlobalData}
              onInitiateIssue={handleInitiateIssue}
            />
          )}

          {/* Book Issue Tab */}
          {currentTab === 'issue' && (
            <BookIssueView
              preselectedBookId={preselectedBookId}
              onClearPreselectedBook={() => setPreselectedBookId(null)}
              onInitiateReturn={handleInitiateReturn}
              onRefreshDashboard={fetchGlobalData}
            />
          )}

          {/* Book Return Tab */}
          {currentTab === 'return' && (
            <BookReturnView
              preselectedIssueId={preselectedIssueId}
              onClearPreselectedIssue={() => setPreselectedIssueId(null)}
              onOpenReceipt={handleOpenReceipt}
              onRefreshDashboard={fetchGlobalData}
            />
          )}

          {/* Search Books Tab */}
          {currentTab === 'search' && (
            <BookSearchView
              books={books}
              onInitiateIssue={handleInitiateIssue}
            />
          )}

          {/* Students Management Tab */}
          {currentTab === 'students' && (
            <StudentManagementView
              onInitiateIssueToStudent={studentId => {
                setCurrentTab('issue');
              }}
            />
          )}

          {/* Reports Tab */}
          {currentTab === 'reports' && <ReportsView />}

          {/* Settings Tab */}
          {currentTab === 'settings' && (
            <SettingsView onRefreshAll={fetchGlobalData} />
          )}
        </main>
      </div>

      {/* Official Return Receipt Modal */}
      <ReceiptModal
        receipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </AuthProvider>
  );
}
