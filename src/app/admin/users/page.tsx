'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import MainLayout from '@/components/MainLayout';
import { usersApi, groupsApi, rolesApi, User, Group, Role, CreateUserRequest } from '@/lib/api';

interface UserFormData {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    userroleid: number;
    groupid: number;
    isblocked?: boolean;
}

interface GroupFormData {
    name: string;
}

const emptyUserForm: UserFormData = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    userroleid: 1,
    groupid: 1,
    isblocked: false,
};

const emptyGroupForm: GroupFormData = {
    name: '',
};

export default function UsersAdminPage() {
    const { user: currentUser, isLoading: authLoading } = useAuth();
    const { t } = useLanguage();
    const [users, setUsers] = useState<User[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
    const [userFormData, setUserFormData] = useState<UserFormData>(emptyUserForm);
    const [groupFormData, setGroupFormData] = useState<GroupFormData>(emptyGroupForm);
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [usersData, groupsData, rolesData] = await Promise.all([
                usersApi.getAll(),
                groupsApi.getAll(),
                rolesApi.getAll(),
            ]);
            setUsers(usersData);
            setGroups(groupsData);
            setRoles(rolesData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate random password
    const generateRandomPassword = () => {
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        const stringLength = 16;
        let randomString = "";
        for (let i = 0; i < stringLength; i++) {
            const rnum = Math.floor(Math.random() * chars.length);
            randomString += chars.substring(rnum, rnum + 1);
        }
        return randomString;
    };

    // Check if admin
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!currentUser || currentUser.userRoleId !== 1) {
        return (
            <MainLayout>
                <div className="max-w-lg mx-auto text-center py-12">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">⛔ {t('error')}</h1>
                    <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
                </div>
            </MainLayout>
        );
    }

    const openCreateUserModal = () => {
        setEditingUser(null);
        setUserFormData(emptyUserForm);
        setShowUserModal(true);
    };

    const openEditUserModal = (user: User) => {
        setEditingUser(user);
        setUserFormData({
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            password: '', // Don't prefill password
            userroleid: typeof user.userroleid === 'object' ? user.userroleid._id : user.userroleid,
            groupid: typeof user.groupid === 'object' ? user.groupid._id : user.groupid,
            isblocked: user.isblocked,
        });
        setShowUserModal(true);
    };

    const openCreateGroupModal = () => {
        setGroupFormData(emptyGroupForm);
        setShowGroupModal(true);
    };

    const openPasswordModal = (user: User) => {
        setSelectedUserForPassword(user);
        setNewPassword('');
        setShowPasswordModal(true);
    };

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (editingUser) {
                // Update user
                await usersApi.update({
                    _id: editingUser._id,
                    firstname: userFormData.firstname,
                    lastname: userFormData.lastname,
                    email: userFormData.email,
                    userroleid: userFormData.userroleid,
                    groupid: userFormData.groupid,
                    isblocked: userFormData.isblocked,
                });
            } else {
                // Create user
                await usersApi.create({
                    firstname: userFormData.firstname,
                    lastname: userFormData.lastname,
                    email: userFormData.email,
                    password: userFormData.password,
                    userroleid: userFormData.userroleid,
                    groupid: userFormData.groupid,
                });
            }
            setShowUserModal(false);
            fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGroupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await groupsApi.create(groupFormData.name);
            setShowGroupModal(false);
            fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create group');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserForPassword || newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            await usersApi.resetPassword(selectedUserForPassword.email, newPassword);
            setShowPasswordModal(false);
            setSelectedUserForPassword(null);
            setNewPassword('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset password');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleBlockUser = async (user: User) => {
        try {
            await usersApi.update({
                _id: user._id,
                isblocked: !user.isblocked,
            });
            fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update user');
        }
    };

    const getRoleName = (roleId: number | Role): string => {
        if (typeof roleId === 'object') return roleId.name;
        const role = roles.find(r => r._id === roleId);
        return role?.name || `Role ${roleId}`;
    };

    const getGroupName = (groupId: number | Group): string => {
        if (typeof groupId === 'object') return groupId.name;
        const group = groups.find(g => g._id === groupId);
        return group?.name || `Group ${groupId}`;
    };

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        👥 {t('settingsMenuUserBtn')}
                    </h1>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                            onClick={fetchData}
                            className="btn btn-outline text-sm px-3 py-2 flex-1 sm:flex-initial"
                            disabled={isLoading}
                        >
                            <span className="mr-2">🔄</span>
                            <span className="hidden sm:inline">{t('btnRefresh')}</span>
                            <span className="sm:hidden">Refresh</span>
                        </button>
                        <button
                            onClick={openCreateUserModal}
                            className="btn btn-primary text-sm px-3 py-2 flex-1 sm:flex-initial"
                        >
                            <span className="mr-2">👤</span>
                            <span className="hidden sm:inline">{t('btnNewUser')}</span>
                            <span className="sm:hidden">User</span>
                        </button>
                        <button
                            onClick={openCreateGroupModal}
                            className="btn btn-primary text-sm px-3 py-2 flex-1 sm:flex-initial"
                        >
                            <span className="mr-2">👥</span>
                            <span className="hidden sm:inline">{t('btnNewGroup')}</span>
                            <span className="sm:hidden">Group</span>
                        </button>
                    </div>
                </div>

                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <span className="mr-2">💡</span>
                    {t('lbClickEditUser')}
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
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">{t('gridFirstName')}</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">{t('gridLastName')}</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">{t('gridEmail')}</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">{t('gridRole')}</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">{t('gridGroup')}</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">{t('gridBlocked')}</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {users.map((user) => (
                                        <tr 
                                            key={user._id} 
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                            onDoubleClick={() => openEditUserModal(user)}
                                        >
                                            <td className="px-4 py-3 text-gray-800 dark:text-white">
                                                {user.firstname}
                                            </td>
                                            <td className="px-4 py-3 text-gray-800 dark:text-white">
                                                {user.lastname}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                                                {getRoleName(user.userroleid)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                                                {getGroupName(user.groupid)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isblocked
                                                        ? 'bg-red-100 text-red-600'
                                                        : 'bg-green-100 text-green-600'
                                                    }`}>
                                                    {user.isblocked ? 'Blocked' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditUserModal(user)}
                                                        className="text-blue-500 hover:text-blue-700 text-sm"
                                                        title={t('btnEditUser')}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => openPasswordModal(user)}
                                                        className="text-orange-500 hover:text-orange-700 text-sm"
                                                        title="Reset Password"
                                                    >
                                                        🔑
                                                    </button>
                                                    <button
                                                        onClick={() => toggleBlockUser(user)}
                                                        className={`text-sm ${user.isblocked
                                                                ? 'text-green-500 hover:text-green-700'
                                                                : 'text-red-500 hover:text-red-700'
                                                            }`}
                                                        title={user.isblocked ? 'Unblock' : 'Block'}
                                                    >
                                                        {user.isblocked ? '✅' : '🚫'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {users.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                Total: {users.length} users
                            </div>
                        )}
                    </div>
                )}

                {/* User Modal */}
                {showUserModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                {editingUser ? t('btnEditUser') : t('btnNewUser')}
                            </h3>

                            <form onSubmit={handleUserSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            {t('gridFirstName')}
                                        </label>
                                        <input
                                            type="text"
                                            value={userFormData.firstname}
                                            onChange={(e) => setUserFormData(prev => ({ ...prev, firstname: e.target.value }))}
                                            className="input"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            {t('gridLastName')}
                                        </label>
                                        <input
                                            type="text"
                                            value={userFormData.lastname}
                                            onChange={(e) => setUserFormData(prev => ({ ...prev, lastname: e.target.value }))}
                                            className="input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        {t('gridEmail')}
                                    </label>
                                    <input
                                        type="email"
                                        value={userFormData.email}
                                        onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="input"
                                        required
                                    />
                                </div>

                                {!editingUser && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Password
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="password"
                                                value={userFormData.password}
                                                onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                                                className="input flex-1"
                                                required={!editingUser}
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const randomPw = generateRandomPassword();
                                                    setUserFormData(prev => ({ ...prev, password: randomPw }));
                                                }}
                                                className="btn btn-outline text-sm px-3"
                                                title="Generate Random Password"
                                            >
                                                🎲
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            {t('gridRole')}
                                        </label>
                                        <select
                                            value={userFormData.userroleid}
                                            onChange={(e) => setUserFormData(prev => ({ ...prev, userroleid: parseInt(e.target.value) }))}
                                            className="input"
                                        >
                                            {roles.map(role => (
                                                <option key={role._id} value={role._id}>{role.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            {t('gridGroup')}
                                        </label>
                                        <select
                                            value={userFormData.groupid}
                                            onChange={(e) => setUserFormData(prev => ({ ...prev, groupid: parseInt(e.target.value) }))}
                                            className="input"
                                        >
                                            {groups.map(group => (
                                                <option key={group._id} value={group._id}>{group.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {editingUser && (
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isblocked"
                                            checked={userFormData.isblocked || false}
                                            onChange={(e) => setUserFormData(prev => ({ ...prev, isblocked: e.target.checked }))}
                                            className="mr-2"
                                        />
                                        <label htmlFor="isblocked" className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {t('gridBlocked')}
                                        </label>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowUserModal(false)}
                                        className="btn btn-outline flex-1"
                                        disabled={isSubmitting}
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary flex-1"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? t('saving') : t('save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Group Modal */}
                {showGroupModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                {t('btnNewGroup')}
                            </h3>

                            <form onSubmit={handleGroupSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Group Name
                                    </label>
                                    <input
                                        type="text"
                                        value={groupFormData.name}
                                        onChange={(e) => setGroupFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="input"
                                        required
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowGroupModal(false)}
                                        className="btn btn-outline flex-1"
                                        disabled={isSubmitting}
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary flex-1"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? t('saving') : t('save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Password Reset Modal */}
                {showPasswordModal && selectedUserForPassword && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                🔑 Reset Password
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Resetting password for: <strong>{selectedUserForPassword.firstname} {selectedUserForPassword.lastname}</strong>
                            </p>

                            <form onSubmit={handlePasswordReset} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        New Password
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="input flex-1"
                                            required
                                            minLength={8}
                                            placeholder="At least 8 characters"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setNewPassword(generateRandomPassword())}
                                            className="btn btn-outline text-sm px-3"
                                            title="Generate Random Password"
                                        >
                                            🎲
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordModal(false);
                                            setSelectedUserForPassword(null);
                                            setNewPassword('');
                                        }}
                                        className="btn btn-outline flex-1"
                                        disabled={isSubmitting}
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary flex-1"
                                        disabled={isSubmitting || newPassword.length < 8}
                                    >
                                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}