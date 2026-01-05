'use client';

import { useEffect } from 'react';

export default function ThemeScript() {
    useEffect(() => {
        const savedTheme = localStorage.getItem('family-expenses-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        
        if (shouldUseDark) {
            document.documentElement.classList.add('dark');
            document.body.style.backgroundColor = '#0a0a0a';
            document.body.style.color = '#ededed';
        } else {
            document.documentElement.classList.remove('dark');
            document.body.style.backgroundColor = '#ffffff';
            document.body.style.color = '#171717';
        }
    }, []);

    return null;
}