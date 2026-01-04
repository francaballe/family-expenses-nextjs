'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth, getRememberedEmail } from '@/contexts/auth-context';

export default function LoginPage() {
    const { login, isLoading: authLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const remembered = getRememberedEmail();
        if (remembered) {
            setEmail(remembered);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }

        if (password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password, rememberMe);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
            {/* Logo and Title */}
            <div className="text-center mb-8">
                <div className="mb-4">
                    <div className="w-48 h-48 md:w-64 md:h-64 mx-auto relative rounded-2xl overflow-hidden shadow-2xl">
                        <Image
                            src="/logo.webp"
                            alt="Family Expenses Logo"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-primary title-text mt-6">
                    FAMILY EXPENSES
                </h1>
            </div>

            {/* Login Form */}
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
            >
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-center text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="input"
                        autoComplete="username"
                        disabled={isLoading}
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="input"
                        autoComplete="current-password"
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn btn-primary mt-6 text-lg uppercase tracking-wide"
                >
                    {isLoading ? 'Authenticating...' : 'Login'}
                </button>

                <div className="flex items-center justify-center mt-4 gap-2">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                        Remember me
                    </span>
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 accent-primary cursor-pointer"
                        disabled={isLoading}
                    />
                </div>

                {isLoading && (
                    <div className="flex justify-center mt-6">
                        <div className="spinner"></div>
                    </div>
                )}
            </form>

            {/* Version */}
            <div className="mt-8 text-gray-500 text-sm">
                Version: 2.0.0
            </div>
        </div>
    );
}
