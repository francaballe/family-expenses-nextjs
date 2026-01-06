'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        logout();
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const navItems = [
        {
            name: t('familyExpensesTitle'),
            path: '/',
            icon: '🏠'
        },
        {
            name: t('btnNewExpense'),
            path: '/expenses/new',
            icon: '💰'
        },
        {
            name: t('btnMyExpenses'),
            path: '/expenses',
            icon: '📊'
        },
    ];

    // Admin-only items (insert before settings)
    if (user?.userRoleId === 1) {
        navItems.push({
            name: 'Usuarios',
            path: '/admin/users',
            icon: '👥'
        });
    }

    // Settings always at the end
    navItems.push({
        name: t('settingsTitle'),
        path: '/settings',
        icon: '⚙️'
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-md">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="text-lg font-bold text-primary">{t('familyExpensesTitle')}</h1>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>
            </header>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 shadow-xl
                transform transition-transform duration-300 ease-in-out
                lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-primary">{t('familyExpensesTitle')}</h1>
                    {user && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {t('greetingsTitle')}, {user.firstname}
                        </p>
                    )}
                </div>

                {/* Navigation */}
                <nav className="p-4 flex-1">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    href={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                        ${pathname === item.path
                                            ? 'bg-primary text-white shadow-md'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }
                                    `}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Version Section */}
                <div className="absolute bottom-20 left-0 right-0 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{t('lbVersion')}: </span>
                        <span>3.1.0</span>
                    </div>
                </div>

                {/* Logout Button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    >
                        <span>🚪</span>
                        <span className="font-medium">{t('btnLogout')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            🚪 {t('btnLogout')}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {t('diagLogout')}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelLogout}
                                className="flex-1 px-4 py-2 rounded-lg transition-colors border"
                                style={{
                                    backgroundColor: '#ffffff',
                                    color: '#000000',
                                    borderColor: '#d1d5db'
                                }}
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                {t('btnLogout')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
