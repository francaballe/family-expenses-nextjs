'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>('light');

    useEffect(() => {
        // Initialize theme from localStorage
        const savedTheme = localStorage.getItem('family-expenses-theme') as Theme;
        if (savedTheme === 'dark' || savedTheme === 'light') {
            setThemeState(savedTheme);
            applyTheme(savedTheme);
        } else {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme: Theme = prefersDark ? 'dark' : 'light';
            setThemeState(systemTheme);
            applyTheme(systemTheme);
        }
    }, []);

    const applyTheme = (newTheme: Theme) => {
        const html = document.documentElement;
        console.log('Applying theme:', newTheme);
        console.log('HTML element before:', html.className);
        
        if (newTheme === 'dark') {
            html.classList.add('dark');
            html.setAttribute('data-theme', 'dark');
            // Forzar estilos al body
            document.body.style.backgroundColor = '#0a0a0a';
            document.body.style.color = '#ededed';
        } else {
            html.classList.remove('dark');
            html.setAttribute('data-theme', 'light');
            // Forzar estilos al body
            document.body.style.backgroundColor = '#ffffff';
            document.body.style.color = '#171717';
        }
        
        console.log('HTML element after:', html.className);
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        applyTheme(newTheme);
        localStorage.setItem('family-expenses-theme', newTheme);
    };

    const toggleTheme = () => {
        const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};