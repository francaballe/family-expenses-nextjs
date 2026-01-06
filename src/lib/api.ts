// API client utility with authentication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface FetchOptions extends RequestInit {
    skipAuth?: boolean;
}

// Global flag to prevent multiple logout attempts
let isLoggingOut = false;

export async function apiFetch<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add auth token if available and not skipped
    if (!skipAuth && typeof window !== 'undefined') {
        const token = localStorage.getItem('family_expenses_token');
        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
    });

    if (!response.ok) {
        // Handle authorization errors
        if (response.status === 401 && !isLoggingOut) {
            isLoggingOut = true;
            
            // Clear token and trigger logout through event
            if (typeof window !== 'undefined') {
                localStorage.removeItem('family_expenses_token');
                
                // Dispatch custom event to notify auth context
                window.dispatchEvent(new CustomEvent('auth:token-expired'));
            }
            
            throw new Error('Session expired. Please login again.');
        }
        
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

// Auth API
export const authApi = {
    login: (email: string, password: string) => {
        const qry = btoa(`${email}|${password}`);
        return apiFetch<{ token: string }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ qry }),
            skipAuth: true,
        });
    },
};

// Expenses API
export const expensesApi = {
    getAll: (params?: { year?: number; month?: number; groupid?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.year) searchParams.set('year', params.year.toString());
        if (params?.month) searchParams.set('month', params.month.toString());
        if (params?.groupid) searchParams.set('groupid', params.groupid.toString());
        const query = searchParams.toString();
        return apiFetch<Expense[]>(`/api/expenses${query ? `?${query}` : ''}`);
    },
    create: (expenses: Partial<Expense>[]) =>
        apiFetch<Expense[]>('/api/expenses', {
            method: 'POST',
            body: JSON.stringify(expenses),
        }),
};

// Users API
export const usersApi = {
    getAll: (groupid?: number) => {
        const query = groupid ? `?groupid=${groupid}` : '';
        return apiFetch<User[]>(`/api/users${query}`);
    },
    create: (user: CreateUserRequest) =>
        apiFetch<User>('/api/users', {
            method: 'POST',
            body: JSON.stringify(user),
        }),
    update: (user: Partial<User>) =>
        apiFetch<User>('/api/users', {
            method: 'PUT',
            body: JSON.stringify(user),
        }),
    changePassword: (email: string, currentPassword: string, newPassword: string) =>
        apiFetch<User>('/api/users', {
            method: 'PATCH',
            body: JSON.stringify({ email, currentPassword, newPassword }),
        }),
    resetPassword: (email: string, newPassword: string) =>
        apiFetch<{ message: string }>('/api/users/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email, newPassword }),
        }),
};

// Groups API
export const groupsApi = {
    getAll: () => apiFetch<Group[]>('/api/groups'),
    create: (name: string) =>
        apiFetch<Group>('/api/groups', {
            method: 'POST',
            body: JSON.stringify({ name }),
        }),
};

// Roles API
export const rolesApi = {
    getAll: () => apiFetch<Role[]>('/api/roles'),
    create: (name: string) =>
        apiFetch<Role>('/api/roles', {
            method: 'POST',
            body: JSON.stringify({ name }),
        }),
};

// Closed Months API
export const closedMonthsApi = {
    getAll: (params?: { year?: string; month?: string; groupid?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.year) searchParams.set('year', params.year);
        if (params?.month) searchParams.set('month', params.month);
        if (params?.groupid) searchParams.set('groupid', params.groupid.toString());
        const query = searchParams.toString();
        return apiFetch<ClosedMonth[]>(`/api/closedmonths${query ? `?${query}` : ''}`);
    },
    getLast: (groupid: number) =>
        apiFetch<ClosedMonth | null>(`/api/closedmonths?last=true&groupid=${groupid}`),
    create: (data: Partial<ClosedMonth>) =>
        apiFetch<ClosedMonth>('/api/closedmonths', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// Types
export interface Expense {
    _id?: string;
    userid: string;
    description: string;
    amount: number;
    expensedate: string;
    duedate?: string;
    comments?: string;
}

export interface User {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    userroleid: number | Role;
    groupid: number | Group;
    isblocked: boolean;
    lastlogin?: string;
    createdAt?: string;
}

export interface CreateUserRequest {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    userroleid: number;
    groupid: number;
}

export interface Group {
    _id: number;
    name: string;
}

export interface Role {
    _id: number;
    name: string;
}

export interface ClosedMonth {
    _id?: string;
    monthandyear: string;
    groupid: number;
    totals: {
        userId: string;
        total: number;
    }[];
}

export interface UserTokenInfo {
    id: string;
    email: string;
    firstname: string;
    userRoleId: number;
    isBlocked: boolean;
    groupid: number;
    usersInGroup: { _id: string; firstname: string }[];
}
