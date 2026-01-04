'use client';

import { useAuth } from '@/contexts/auth-context';
import MainLayout from '@/components/MainLayout';
import PathList from '@/components/PathList';

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via auth context
  }

  const expensesPaths = [
    {
      name: 'New Expense',
      icon: '💰',
      path: '/expenses/new',
      disabled: false,
      summary: 'Add a new expense to track',
    },
    {
      name: 'My Expenses',
      icon: '📊',
      path: '/expenses',
      disabled: false,
      summary: 'View and manage your expenses',
    },
    {
      name: 'Expense History',
      icon: '📈',
      path: '/expenses/history',
      disabled: true,
      summary: 'Coming soon',
    },
  ];

  // Admin-only paths
  const adminPaths = user.userRoleId === 0 ? [
    {
      name: 'Users Admin',
      icon: '👥',
      path: '/admin/users',
      disabled: false,
      summary: 'Manage users and roles',
    },
  ] : [];

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Welcome, {user.firstname}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            What would you like to do today?
          </p>
        </div>

        {/* Expenses Section */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">💵</span>
            <h2 className="text-xl font-semibold text-secondary">Expenses</h2>
          </div>
          <PathList paths={expensesPaths} />
        </section>

        {/* Settings */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-xl font-semibold text-secondary">Settings</h2>
          </div>
          <PathList paths={[
            {
              name: 'User Settings',
              icon: '👤',
              path: '/settings',
              disabled: false,
              summary: 'Change password and preferences',
            },
          ]} />
        </section>

        {/* Admin Section (if admin) */}
        {adminPaths.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🔧</span>
              <h2 className="text-xl font-semibold text-secondary">Administration</h2>
            </div>
            <PathList paths={adminPaths} />
          </section>
        )}
      </div>
    </MainLayout>
  );
}
