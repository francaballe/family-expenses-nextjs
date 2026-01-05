'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import MainLayout from '@/components/MainLayout';
import { expensesApi, closedMonthsApi, Expense } from '@/lib/api';

// Dynamic import for ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type ViewMode = 'details' | 'summary';

export default function MyExpensesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { t } = useLanguage();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('details');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [showCloseMonthModal, setShowCloseMonthModal] = useState(false);
    const [isClosingMonth, setIsClosingMonth] = useState(false);
    const [isMonthClosed, setIsMonthClosed] = useState(false);

    const months = [
        t('month.january'), t('month.february'), t('month.march'), t('month.april'), 
        t('month.may'), t('month.june'), t('month.july'), t('month.august'), 
        t('month.september'), t('month.october'), t('month.november'), t('month.december')
    ];

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => currentYear - i);
    }, []);

    useEffect(() => {
        if (user) {
            fetchExpenses();
            checkIfMonthIsClosed();
        }
    }, [user, selectedYear, selectedMonth]);

    const fetchExpenses = async () => {
        if (!user) return;
        setIsLoading(true);
        setError(null);

        try {
            const data = await expensesApi.getAll({
                year: selectedYear,
                month: selectedMonth,
                groupid: user.groupid,
            });
            setExpenses(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
        } finally {
            setIsLoading(false);
        }
    };

    const checkIfMonthIsClosed = async () => {
        if (!user) return;

        try {
            const formatMonth = (month: number) => month.toString().padStart(2, '0');
            
            const response = await closedMonthsApi.getAll({
                month: formatMonth(selectedMonth),
                year: selectedYear.toString(),
                groupid: user.groupid
            });
            
            setIsMonthClosed(response.length > 0);
        } catch (err) {
            console.error('Error checking if month is closed:', err);
            setIsMonthClosed(false);
        }
    };

    // Get the two users in the group
    const firstUser = user?.usersInGroup[0];
    const secondUser = user?.usersInGroup[1];

    // Filter expenses by user
    const expensesByFirstUser = useMemo(() =>
        expenses.filter(e => e.userid === firstUser?._id),
        [expenses, firstUser]
    );

    const expensesBySecondUser = useMemo(() =>
        expenses.filter(e => e.userid === secondUser?._id),
        [expenses, secondUser]
    );

    // Calculate totals
    const totalFirstUser = useMemo(() =>
        expensesByFirstUser.reduce((sum, e) => sum + e.amount, 0),
        [expensesByFirstUser]
    );

    const totalSecondUser = useMemo(() =>
        expensesBySecondUser.reduce((sum, e) => sum + e.amount, 0),
        [expensesBySecondUser]
    );

    const totalMonth = totalFirstUser + totalSecondUser;

    const debt = useMemo(() => {
        const halfTotal = totalMonth / 2;
        if (totalFirstUser > halfTotal) {
            return {
                user: secondUser?.firstname || 'User 2',
                owesTo: firstUser?.firstname || 'User 1',
                amount: totalFirstUser - halfTotal,
            };
        } else {
            return {
                user: firstUser?.firstname || 'User 1',
                owesTo: secondUser?.firstname || 'User 2',
                amount: totalSecondUser - halfTotal,
            };
        }
    }, [totalFirstUser, totalSecondUser, totalMonth, firstUser, secondUser]);

    // Calculate Top 5 expenses by concept
    const top5Expenses = useMemo(() => {
        // Group expenses by description and sum amounts
        const grouped: Record<string, number> = {};
        expenses.forEach(expense => {
            grouped[expense.description] = (grouped[expense.description] || 0) + expense.amount;
        });

        // Convert to array and sort by amount
        const sortedExpenses = Object.entries(grouped)
            .map(([description, amount]) => ({ description, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        // Fill with empty items if less than 5
        while (sortedExpenses.length < 5) {
            sortedExpenses.push({ description: t('lbNoTop5Item'), amount: 0 });
        }

        return sortedExpenses;
    }, [expenses, t]);

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-AR');
    };

    const handleCloseMonth = async () => {
        if (!user) return;
        setIsClosingMonth(true);

        try {
            const monthStr = selectedMonth.toString().padStart(2, '0');
            await closedMonthsApi.create({
                monthandyear: `${monthStr}${selectedYear}`,
                groupid: user.groupid,
                totals: [
                    { userId: firstUser?._id || '', total: totalFirstUser },
                    { userId: secondUser?._id || '', total: totalSecondUser },
                ],
            });
            setShowCloseMonthModal(false);
            // Optionally navigate to next month
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to close month');
        } finally {
            setIsClosingMonth(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    📈 {t('expensesTitle')}
                </h1>

                {/* Month/Year Selector and View Toggle */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex gap-2 flex-1">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="input w-48"
                        >
                            {months.map((month, idx) => (
                                <option key={idx + 1} value={idx + 1}>{month}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="input w-12"
                        >
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('details')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'details'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {t('details')}
                        </button>
                        <button
                            onClick={() => setViewMode('summary')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'summary'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {t('summary')}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="spinner"></div>
                    </div>
                ) : viewMode === 'details' ? (
                    /* DETAILS VIEW */
                    <div className="space-y-6">
                        {/* First User Expenses */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                            <h2 className="text-lg font-semibold text-secondary mb-4">
                                {t('expensesForTitle')} {firstUser?.firstname || 'User 1'}
                            </h2>
                            {expensesByFirstUser.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">{t('noExpenses')}</p>
                            ) : (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-500 pb-2 border-b">
                                        <span>{t('concept')}</span>
                                        <span className="text-right">{t('amount')}</span>
                                        <span className="text-right">{t('date')}</span>
                                    </div>
                                    {expensesByFirstUser.map((expense, idx) => (
                                        <div key={idx} className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-800 dark:text-gray-200 truncate" title={expense.description || ''}>
                                                    {expense.description || ''}
                                                </span>
                                                {(expense.duedate || expense.comments) && (
                                                    <div 
                                                        className="text-accent cursor-help"
                                                        title={[
                                                            expense.duedate ? `${t('phDueDate')}: ${formatDate(expense.duedate)}` : '',
                                                            expense.comments ? `${t('commentsToolTip')}: ${expense.comments}` : ''
                                                        ].filter(Boolean).join('\n')}
                                                    >
                                                        ℹ️
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-right text-primary font-medium">
                                                {formatAmount(expense.amount)}
                                            </span>
                                            <span className="text-right text-gray-500 text-sm">
                                                {formatDate(expense.expensedate)}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between pt-2 font-semibold">
                                        <span>{t('total')}</span>
                                        <span className="text-primary">{formatAmount(totalFirstUser)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Second User Expenses */}
                        {secondUser && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                <h2 className="text-lg font-semibold text-secondary mb-4">
                                    {t('expensesForTitle')} {secondUser.firstname}
                                </h2>
                                {expensesBySecondUser.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">{t('noExpenses')}</p>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-500 pb-2 border-b">
                                            <span>{t('concept')}</span>
                                            <span className="text-right">{t('amount')}</span>
                                            <span className="text-right">{t('date')}</span>
                                        </div>
                                        {expensesBySecondUser.map((expense, idx) => (
                                            <div key={idx} className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-800 dark:text-gray-200 truncate" title={expense.description || ''}>
                                                        {expense.description || ''}
                                                    </span>
                                                    {(expense.duedate || expense.comments) && (
                                                        <div 
                                                            className="text-accent cursor-help"
                                                            title={[
                                                                expense.duedate ? `${t('phDueDate')}: ${formatDate(expense.duedate)}` : '',
                                                                expense.comments ? `${t('commentsToolTip')}: ${expense.comments}` : ''
                                                            ].filter(Boolean).join('\n')}
                                                        >
                                                            ℹ️
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-right text-primary font-medium">
                                                    {formatAmount(expense.amount)}
                                                </span>
                                                <span className="text-right text-gray-500 text-sm">
                                                    {formatDate(expense.expensedate)}
                                                </span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between pt-2 font-semibold">
                                            <span>{t('total')}</span>
                                            <span className="text-primary">{formatAmount(totalSecondUser)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    /* SUMMARY VIEW */
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <h2 className="text-lg font-semibold text-secondary mb-6">
                            {t('monthSummary')} - {months[selectedMonth - 1]} {selectedYear}
                        </h2>

                        <div className="space-y-4">
                            {/* User Totals */}
                            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-700 dark:text-gray-300">
                                    Total {firstUser?.firstname || 'User 1'}:
                                </span>
                                <span className="font-semibold text-primary text-lg">
                                    {formatAmount(totalFirstUser)}
                                </span>
                            </div>

                            {secondUser && (
                                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-700 dark:text-gray-300">
                                        Total {secondUser.firstname}:
                                    </span>
                                    <span className="font-semibold text-primary text-lg">
                                        {formatAmount(totalSecondUser)}
                                    </span>
                                </div>
                            )}

                            {/* Month Total */}
                            <div className="flex justify-between items-center py-3 border-b-2 border-gray-300 dark:border-gray-600">
                                <span className="text-gray-800 dark:text-gray-200 font-semibold">
                                    {t('totalThisMonthTitle')}:
                                </span>
                                <span className="font-bold text-primary text-xl">
                                    {formatAmount(totalMonth)}
                                </span>
                            </div>

                            {/* Debt */}
                            {debt.amount > 0 && (
                                <div className="flex justify-between items-center py-3 bg-accent/10 rounded-lg px-4 mt-4">
                                    <span className="text-accent font-medium">
                                        {t('totalDebtTitle')} {debt.user}:
                                    </span>
                                    <span className="font-bold text-accent text-lg">
                                        {formatAmount(debt.amount)}
                                    </span>
                                </div>
                            )}

                            {/* Top 5 Section */}
                            <div className="mt-6">
                                <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                        {t('top5ThisMonthTitle')}
                                    </h3>
                                    <div className="space-y-2">
                                        {top5Expenses.map((expense, index) => (
                                            <div
                                                key={index}
                                                className={`flex justify-between items-center py-2 px-4 rounded-lg ${
                                                    index % 2 === 0
                                                        ? 'bg-gray-100 dark:bg-gray-700'
                                                        : 'bg-white dark:bg-gray-800'
                                                }`}
                                            >
                                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                    {expense.description}
                                                </span>
                                                <span className="text-gray-800 dark:text-gray-200 font-semibold">
                                                    {expense.amount > 0 ? formatAmount(expense.amount) : '-'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Analytics Section */}
                            <div className="mt-6">
                                <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                        {t('analyticsTitle')}
                                    </h3>
                                    <div className="flex justify-center">
                                        {typeof window !== 'undefined' && (
                                            <Chart
                                                options={{
                                                    chart: {
                                                        type: 'pie',
                                                    },
                                                    labels: [
                                                        ...top5Expenses.slice(0, 5).map(e => e.description),
                                                        t('lbChartOthers')
                                                    ],
                                                    colors: [
                                                        "#FF5733",
                                                        "#FFD700", 
                                                        "#33FF57",
                                                        "#3366FF",
                                                        "#FFC0CB",
                                                        "#800080"
                                                    ],
                                                    tooltip: {
                                                        y: {
                                                            formatter: function(value: number) {
                                                                return value.toFixed(1) + '%';
                                                            }
                                                        }
                                                    },
                                                    legend: {
                                                        position: 'bottom',
                                                        labels: {
                                                            colors: '#6B7280'
                                                        }
                                                    },
                                                    responsive: [{
                                                        breakpoint: 480,
                                                        options: {
                                                            chart: {
                                                                width: 300
                                                            },
                                                            legend: {
                                                                position: 'bottom'
                                                            }
                                                        }
                                                    }]
                                                }}
                                                series={(() => {
                                                    const top5Total = top5Expenses.slice(0, 5).reduce((sum, e) => sum + e.amount, 0);
                                                    const othersAmount = Math.max(0, totalMonth - top5Total);
                                                    
                                                    const percentages = [
                                                        ...top5Expenses.slice(0, 5).map(e => totalMonth > 0 ? (e.amount * 100) / totalMonth : 0),
                                                        totalMonth > 0 ? (othersAmount * 100) / totalMonth : 0
                                                    ];
                                                    
                                                    return percentages;
                                                })()}
                                                type="pie"
                                                width={500}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Close Month Button */}
                            <div className="pt-6 flex justify-center">
                                <button
                                    onClick={() => setShowCloseMonthModal(true)}
                                    className={`btn btn-primary ${expenses.length === 0 || isMonthClosed ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                    disabled={expenses.length === 0 || isMonthClosed}
                                >
                                    {t('btnPayAndCloseMonth')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Close Month Modal */}
                {showCloseMonthModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                {t('confirmCloseMonth')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {t('confirmCloseMonthText', { month: months[selectedMonth - 1], year: selectedYear.toString() })}
                                {' '}
                                {t('actionCannotBeUndone')}
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowCloseMonthModal(false)}
                                    className="btn btn-outline flex-1"
                                    disabled={isClosingMonth}
                                >
                                    {t('btnCancel')}
                                </button>
                                <button
                                    onClick={handleCloseMonth}
                                    className="btn btn-primary flex-1"
                                    disabled={isClosingMonth}
                                >
                                    {isClosingMonth ? t('closing') : t('btnCloseMonth')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
