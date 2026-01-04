import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_KEY = process.env.JWT_KEY || 'your-secret-key';

export interface UserTokenPayload {
    id: string;
    email: string;
    firstname: string;
    userRoleId: number;
    isBlocked: boolean;
    groupid: number;
    usersInGroup: any[];
}

export function verifyToken(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_KEY) as UserTokenPayload;
        return decoded;
    } catch (err) {
        return null;
    }
}

export function unauthorizedResponse() {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function tokenExpiredResponse() {
    return NextResponse.json({ error: 'Token expired' }, { status: 419 });
}
