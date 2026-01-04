'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi, UserTokenInfo } from '@/lib/api';

interface AuthContextType {
    user: UserTokenInfo | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string, remember?: boolean) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'family_expenses_token';
const REMEMBER_KEY = 'family_expenses_remember';

function decodeToken(token: string): UserTokenInfo | null {
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded as UserTokenInfo;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserTokenInfo | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (storedToken) {
            const decoded = decodeToken(storedToken);
            if (decoded) {
                setToken(storedToken);
                setUser(decoded);
            } else {
                localStorage.removeItem(TOKEN_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    // Redirect based on auth state
    useEffect(() => {
        if (isLoading) return;

        const publicPaths = ['/login'];
        const isPublicPath = publicPaths.includes(pathname);

        if (!token && !isPublicPath) {
            router.push('/login');
        } else if (token && isPublicPath) {
            router.push('/');
        }
    }, [token, pathname, isLoading, router]);

    const login = useCallback(async (email: string, password: string, remember = false) => {
        const response = await authApi.login(email, password);
        const decoded = decodeToken(response.token);

        if (!decoded) {
            throw new Error('Invalid token received');
        }

        localStorage.setItem(TOKEN_KEY, response.token);

        if (remember) {
            localStorage.setItem(REMEMBER_KEY, email);
        } else {
            localStorage.removeItem(REMEMBER_KEY);
        }

        setToken(response.token);
        setUser(decoded);
        router.push('/');
    }, [router]);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        router.push('/login');
    }, [router]);

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function getRememberedEmail(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REMEMBER_KEY);
}
