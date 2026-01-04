'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    en: {
        // Navigation
        'nav.expenses': 'My Expenses',
        'nav.newExpense': 'New Expense',
        'nav.settings': 'Settings',
        'nav.logout': 'Logout',
        
        // Expenses
        'expenses.title': 'My Expenses',
        'expenses.concept': 'Concept',
        'expenses.amount': 'Amount',
        'expenses.date': 'Date',
        'expenses.total': 'Total',
        'expenses.noExpenses': 'No expenses this month',
        'expenses.details': 'Details',
        'expenses.summary': 'Summary',
        'expenses.forUser': 'Expenses for {name}',
        'expenses.monthSummary': 'Month Summary - {month} {year}',
        
        // New Expense
        'newExpense.title': 'New Expense',
        'newExpense.conceptLabel': 'Concept *',
        'newExpense.conceptPlaceholder': 'What did you spend on?',
        'newExpense.amountLabel': 'Amount *',
        'newExpense.amountPlaceholder': '0.00',
        'newExpense.dateLabel': 'Date *',
        'newExpense.dueDateLabel': 'Due Date (optional)',
        'newExpense.commentsLabel': 'Comments (optional)',
        'newExpense.commentsPlaceholder': 'Any additional notes...',
        'newExpense.addAnother': 'Add Another Expense',
        'newExpense.save': 'Save Expenses',
        'newExpense.saving': 'Saving...',
        'newExpense.remove': 'Remove',
        'newExpense.expenseNumber': 'Expense #{number}',
        
        // Settings
        'settings.title': 'Settings',
        'settings.accountInfo': 'Account Information',
        'settings.name': 'Name',
        'settings.email': 'Email',
        'settings.groupId': 'Group ID',
        'settings.changePassword': 'Change Password',
        'settings.currentPassword': 'Current Password',
        'settings.newPassword': 'New Password',
        'settings.confirmPassword': 'Confirm New Password',
        'settings.changePasswordBtn': 'Change Password',
        'settings.changing': 'Changing...',
        'settings.preferences': 'Preferences',
        'settings.theme': 'Theme',
        'settings.darkMode': 'Dark mode',
        'settings.lightMode': 'Light mode',
        'settings.language': 'Language',
        'settings.english': 'English',
        'settings.spanish': 'Español',
        
        // Common
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.cancel': 'Cancel',
        'common.save': 'Save',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.close': 'Close',
        
        // Months
        'month.january': 'January',
        'month.february': 'February',
        'month.march': 'March',
        'month.april': 'April',
        'month.may': 'May',
        'month.june': 'June',
        'month.july': 'July',
        'month.august': 'August',
        'month.september': 'September',
        'month.october': 'October',
        'month.november': 'November',
        'month.december': 'December',
    },
    es: {
        // Navigation
        'nav.expenses': 'Mis Gastos',
        'nav.newExpense': 'Nuevo Gasto',
        'nav.settings': 'Configuración',
        'nav.logout': 'Cerrar Sesión',
        
        // Expenses
        'expenses.title': 'Mis Gastos',
        'expenses.concept': 'Concepto',
        'expenses.amount': 'Monto',
        'expenses.date': 'Fecha',
        'expenses.total': 'Total',
        'expenses.noExpenses': 'No hay gastos este mes',
        'expenses.details': 'Detalles',
        'expenses.summary': 'Resumen',
        'expenses.forUser': 'Gastos de {name}',
        'expenses.monthSummary': 'Resumen del Mes - {month} {year}',
        
        // New Expense
        'newExpense.title': 'Nuevo Gasto',
        'newExpense.conceptLabel': 'Concepto *',
        'newExpense.conceptPlaceholder': '¿En qué gastaste?',
        'newExpense.amountLabel': 'Monto *',
        'newExpense.amountPlaceholder': '0.00',
        'newExpense.dateLabel': 'Fecha *',
        'newExpense.dueDateLabel': 'Fecha de vencimiento (opcional)',
        'newExpense.commentsLabel': 'Comentarios (opcional)',
        'newExpense.commentsPlaceholder': 'Notas adicionales...',
        'newExpense.addAnother': 'Agregar Otro Gasto',
        'newExpense.save': 'Guardar Gastos',
        'newExpense.saving': 'Guardando...',
        'newExpense.remove': 'Eliminar',
        'newExpense.expenseNumber': 'Gasto #{number}',
        
        // Settings
        'settings.title': 'Configuración',
        'settings.accountInfo': 'Información de la Cuenta',
        'settings.name': 'Nombre',
        'settings.email': 'Email',
        'settings.groupId': 'ID del Grupo',
        'settings.changePassword': 'Cambiar Contraseña',
        'settings.currentPassword': 'Contraseña Actual',
        'settings.newPassword': 'Nueva Contraseña',
        'settings.confirmPassword': 'Confirmar Nueva Contraseña',
        'settings.changePasswordBtn': 'Cambiar Contraseña',
        'settings.changing': 'Cambiando...',
        'settings.preferences': 'Preferencias',
        'settings.theme': 'Tema',
        'settings.darkMode': 'Modo oscuro',
        'settings.lightMode': 'Modo claro',
        'settings.language': 'Idioma',
        'settings.english': 'English',
        'settings.spanish': 'Español',
        
        // Common
        'common.loading': 'Cargando...',
        'common.error': 'Error',
        'common.success': 'Éxito',
        'common.cancel': 'Cancelar',
        'common.save': 'Guardar',
        'common.delete': 'Eliminar',
        'common.edit': 'Editar',
        'common.close': 'Cerrar',
        
        // Months
        'month.january': 'Enero',
        'month.february': 'Febrero',
        'month.march': 'Marzo',
        'month.april': 'Abril',
        'month.may': 'Mayo',
        'month.june': 'Junio',
        'month.july': 'Julio',
        'month.august': 'Agosto',
        'month.september': 'Septiembre',
        'month.october': 'Octubre',
        'month.november': 'Noviembre',
        'month.december': 'Diciembre',
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        // Load saved language from localStorage
        const savedLanguage = localStorage.getItem('family-expenses-language') as Language;
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
            setLanguageState(savedLanguage);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('family-expenses-language', lang);
    };

    const t = (key: string, vars?: Record<string, string>): string => {
        let translation = translations[language][key] || key;
        
        // Replace variables in translation
        if (vars) {
            Object.entries(vars).forEach(([varKey, varValue]) => {
                translation = translation.replace(new RegExp(`{${varKey}}`, 'g'), varValue);
            });
        }
        
        return translation;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};