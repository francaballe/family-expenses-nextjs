'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { useTheme } from '@/contexts/theme-context';
import MainLayout from '@/components/MainLayout';
import { usersApi, groupsApi } from '@/lib/api';

export default function SettingsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [groups, setGroups] = useState<any[]>([]);
    const [userGroupName, setUserGroupName] = useState<string>('');

    // Cargar nombre del grupo del usuario
    useEffect(() => {
        const loadUserGroupName = async () => {
            if (!user) return;
            
            try {
                const groupsData = await groupsApi.getAll();
                const userGroup = groupsData.find((g: any) => g._id === user.groupid);
                
                if (userGroup) {
                    setUserGroupName(userGroup.name);
                } else {
                    setUserGroupName(`Grupo ${user.groupid}`);
                }
            } catch (error) {
                console.error('Error loading user group:', error);
                setUserGroupName(`Grupo ${user.groupid}`);
            }
        };

        loadUserGroupName();
    }, [user]);

    const toggleLanguage = () => {
        const newLanguage = language === 'en' ? 'es' : 'en';
        setLanguage(newLanguage);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) return null;

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validate
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (newPassword.length < 4) {
            setError('New password must be at least 4 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsSubmitting(true);

        try {
            await usersApi.changePassword(user.email, currentPassword, newPassword);
            setSuccess(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to change password');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-lg mx-auto" style={{
                backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#000000',
                minHeight: '100vh',
                padding: '1rem'
            }}>
                <h1 className="text-2xl font-bold mb-6" style={{
                    color: theme === 'dark' ? '#ffffff' : '#1f2937'
                }}>
                    ⚙️ {t('settings.title')}
                </h1>

                {/* User Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-secondary mb-4">
                        {t('settings.accountInfo')}
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">{t('settings.name')}:</span>
                            <span className="font-medium text-gray-800 dark:text-white">
                                {user.firstname}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">{t('settings.email')}:</span>
                            <span className="font-medium text-gray-800 dark:text-white">
                                {user.email}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">{t('settings.groupId')}:</span>
                            <span className="font-medium text-gray-800 dark:text-white">
                                {userGroupName || `Grupo ${user.groupid}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-secondary mb-4">
                        {t('settings.changePassword')}
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
                            ✅ Password changed successfully!
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {t('settings.currentPassword')}
                            </label>
                            <input
                                type="password"
                                value={currentPassword || ''}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="input"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {t('settings.newPassword')}
                            </label>
                            <input
                                type="password"
                                value={newPassword || ''}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                {t('settings.confirmPassword')}
                            </label>
                            <input
                                type="password"
                                value={confirmPassword || ''}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input"
                                disabled={isSubmitting}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary w-full"
                        >
                            {isSubmitting ? t('settings.changing') : t('settings.changePasswordBtn')}
                        </button>
                    </form>
                </div>

                {/* Theme and Language Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mt-6">
                    <h2 className="text-lg font-semibold text-secondary mb-4">
                        {t('settings.preferences')}
                    </h2>
                    
                    <div className="space-y-6">
                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-lg" style={{
                            backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'
                        }}>
                            <div>
                                <h3 className="font-medium" style={{
                                    color: theme === 'dark' ? '#ffffff' : '#1f2937'
                                }}>
                                    {theme === 'dark' ? '🌙' : '☀️'} {t('settings.theme')}
                                </h3>
                                <p className="text-sm" style={{
                                    color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                                }}>
                                    {theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}
                                </p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-gray-600"
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Language Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                                <h3 className="font-medium text-gray-800 dark:text-white">
                                    🌍 {t('settings.language')}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {language === 'en' ? t('settings.english') : t('settings.spanish')}
                                </p>
                            </div>
                            <button
                                onClick={toggleLanguage}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                {language === 'en' ? '🇪🇸 ES' : '🇺🇸 EN'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
