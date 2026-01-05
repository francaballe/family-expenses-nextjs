'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import MainLayout from '@/components/MainLayout';
import { expensesApi, Expense } from '@/lib/api';

interface ExpenseForm {
    description: string;
    amount: string;
    expensedate: string;
    duedate: string;
    comments: string;
}

const emptyExpense: ExpenseForm = {
    description: '',
    amount: '',
    expensedate: new Date().toISOString().split('T')[0],
    duedate: '',
    comments: '',
};

export default function NewExpensePage() {
    const { user, isLoading: authLoading } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [expenses, setExpenses] = useState<ExpenseForm[]>([{ ...emptyExpense }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Lista predefinida de conceptos (igual que en la app anterior)
    const predefinedConcepts = [
        "ABL",
        "Agua", 
        "ARBA",
        "Bomberos",
        "Cabify",
        "Comida",
        "Enrique",
        "Facturas",
        "Gas",
        "Internet",
        "Jardín",
        "Luz",
        "Servicios",
        "Supermercado",
        "Verdulería",
    ];

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) return null;

    const updateExpense = (index: number, field: keyof ExpenseForm, value: string) => {
        setExpenses(prev => prev.map((exp, i) =>
            i === index ? { ...exp, [field]: value } : exp
        ));
    };

    const addExpense = () => {
        setExpenses(prev => [...prev, { ...emptyExpense }]);
    };

    const removeExpense = (index: number) => {
        if (expenses.length > 1) {
            setExpenses(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validate
        const validExpenses = expenses.filter(exp => exp.description && exp.amount);
        if (validExpenses.length === 0) {
            setError('Please add at least one expense with concept and amount');
            return;
        }

        setIsSubmitting(true);

        try {
            const expensesToCreate: Partial<Expense>[] = validExpenses.map(exp => ({
                userid: user.id,
                description: exp.description,
                amount: parseFloat(exp.amount),
                expensedate: exp.expensedate,
                duedate: exp.duedate || undefined,
                comments: exp.comments || undefined,
            }));

            await expensesApi.create(expensesToCreate);
            setSuccess(true);
            setExpenses([{ ...emptyExpense }]);

            // Redirect after success
            setTimeout(() => {
                router.push('/expenses');
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create expenses');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    💰 {t('btnNewExpense')}
                </h1>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded-xl">
                        ✅ Expenses created successfully! Redirecting...
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {expenses.map((expense, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                                    {t('expenseNumber', { number: (index + 1).toString() })}
                                </h3>
                                {expenses.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeExpense(index)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        ✕ {t('remove')}
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        {t('concept')} *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            list={`concepts-${index}`}
                                            value={expense.description || ''}
                                            onChange={(e) => updateExpense(index, 'description', e.target.value)}
                                            className="input pr-16"
                                            placeholder={t('phExpenseDescription')}
                                            required
                                        />
                                        {expense.description && (
                                            <button
                                                type="button"
                                                onClick={() => updateExpense(index, 'description', '')}
                                                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                                aria-label="Clear"
                                            >
                                                ✕
                                            </button>
                                        )}
                                        <datalist id={`concepts-${index}`}>
                                            {predefinedConcepts.map((concept, idx) => (
                                                <option key={idx} value={concept} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            {t('amount')} *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={expense.amount || ''}
                                            onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                                            className="input"
                                            placeholder={t('phExpenseAmount')}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            {t('date')} *
                                        </label>
                                        <input
                                            type="date"
                                            value={expense.expensedate || ''}
                                            onChange={(e) => updateExpense(index, 'expensedate', e.target.value)}
                                            className="input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        {t('phDueDate')}
                                    </label>
                                    <input
                                        type="date"
                                        value={expense.duedate || ''}
                                        onChange={(e) => updateExpense(index, 'duedate', e.target.value)}
                                        className="input"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        {t('phAdditionalComments')}
                                    </label>
                                    <textarea
                                        value={expense.comments || ''}
                                        onChange={(e) => updateExpense(index, 'comments', e.target.value)}
                                        className="input min-h-[80px]"
                                        placeholder={t('phAdditionalComments')}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <button
                            type="button"
                            onClick={addExpense}
                            className="btn btn-outline flex-1"
                        >
                            + {t('addAnother')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary flex-1"
                        >
                            {isSubmitting ? t('saving') : t('btnSaveExpenses')}
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
