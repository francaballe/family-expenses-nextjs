'use client';

import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import MainLayout from '@/components/MainLayout';
import PathList from '@/components/PathList';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();

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
      name: t('btnNewExpense'),
      icon: '💰',
      path: '/expenses/new',
      disabled: false,
      summary: t('home.newExpenseSummary'),
    },
    {
      name: t('btnMyExpenses'),
      icon: '📊',
      path: '/expenses',
      disabled: false,
      summary: t('home.myExpensesSummary'),
    },
  ];

  // Admin-only paths
  const adminPaths = user.userRoleId === 0 ? [
    {
      name: t('settingsMenuUserBtn'),
      icon: '👥',
      path: '/admin/users',
      disabled: false,
      summary: t('home.manageUsersSummary'),
    },
  ] : [];

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {t('home.welcome', { name: user.firstname })} 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('home.whatToDo')}
          </p>
        </div>

        {/* Expenses Section */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">💵</span>
            <h2 className="text-xl font-semibold text-secondary">{t('expensesTitle')}</h2>
          </div>
          <PathList paths={expensesPaths} />
        </section>

        {/* Settings */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-xl font-semibold text-secondary">{t('settingsTitle')}</h2>
          </div>
          <PathList paths={[
            {
              name: t('home.userSettings'),
              icon: '👤',
              path: '/settings',
              disabled: false,
              summary: t('home.userSettingsSummary'),
            },
          ]} />
        </section>

        {/* Admin Section (if admin) */}
        {adminPaths.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🔧</span>
              <h2 className="text-xl font-semibold text-secondary">{t('home.administration')}</h2>
            </div>
            <PathList paths={adminPaths} />
          </section>
        )}
      </div>
    </MainLayout>
  );
}
