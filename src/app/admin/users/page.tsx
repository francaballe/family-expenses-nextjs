'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import MainLayout from '@/components/MainLayout';
import { usersApi, groupsApi, rolesApi, User, Group, Role } from '@/lib/api';

interface UserFormData {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    userroleid: number;
    groupid: number;
}

const emptyForm: UserFormData = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    userroleid: 1,
    groupid: 1,
};

export default function UsersAdminPage() {
    const { user: currentUser, isLoading: authLoading } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormData>(emptyForm);
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

    // Check if admin
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!currentUser || currentUser.userRoleId !== 0) {
        return (
            <MainLayout>
                <div className="max-w-lg mx-auto text-center py-12">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">⛔ Access Denied</h1>
                    <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
                </div>
            </MainLayout>
        );
    }

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData(emptyForm);
        setShowModal(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            password: '', // Don't prefill password
            userroleid: typeof user.userroleid === 'object' ? user.userroleid._id : user.userroleid,
            groupid: typeof user.groupid === 'object' ? user.groupid._id : user.groupid,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (editingUser) {
                // Update user
                await usersApi.update({
                    _id: editingUser._id,
                    firstname: formData.firstname,
                    lastname: formData.lastname,
                    email: formData.email,
                    userroleid: formData.userroleid,
                    groupid: formData.groupid,
                });
            } else {
                // Create user
                await usersApi.create({
                    firstname: formData.firstname,
                    lastname: formData.lastname,
                    email: formData.email,
                    password: formData.password,
                    userroleid: formData.userroleid,
                    groupid: formData.groupid,
                });
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save user');
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
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        👥 Users Admin
                    </h1>
                    <button
                        onClick={openCreateModal}
                        className="btn btn-primary"
                    >
                        + New User
                    </button>
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
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Email</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Role</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Group</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-gray-800 dark:text-white">
                                                {user.firstname} {user.lastname}
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
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="text-blue-500 hover:text-blue-700 text-sm mr-2"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => toggleBlockUser(user)}
                                                    className={`text-sm ${user.isblocked
                                                            ? 'text-green-500 hover:text-green-700'
                                                            : 'text-red-500 hover:text-red-700'
                                                        }`}
                                                >
                                                    {user.isblocked ? 'Unblock' : 'Block'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* User Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                {editingUser ? 'Edit User' : 'Create New User'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.firstname}
                                            onChange={(e) => setFormData(prev => ({ ...prev, firstname: e.target.value }))}
                                            className="input"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.lastname}
                                            onChange={(e) => setFormData(prev => ({ ...prev, lastname: e.target.value }))}
                                            className="input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="input"
                                        required
                                    />
                                </div>

                                {!editingUser && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                            className="input"
                                            required={!editingUser}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Role
                                        </label>
                                        <select
                                            value={formData.userroleid}
                                            onChange={(e) => setFormData(prev => ({ ...prev, userroleid: parseInt(e.target.value) }))}
                                            className="input"
                                        >
                                            {roles.map(role => (
                                                <option key={role._id} value={role._id}>{role.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Group
                                        </label>
                                        <select
                                            value={formData.groupid}
                                            onChange={(e) => setFormData(prev => ({ ...prev, groupid: parseInt(e.target.value) }))}
                                            className="input"
                                        >
                                            {groups.map(group => (
                                                <option key={group._id} value={group._id}>{group.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="btn btn-outline flex-1"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary flex-1"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save'}
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
