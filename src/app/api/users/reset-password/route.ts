import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken, unauthorizedResponse } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;

export async function POST(req: NextRequest) {
    const user = verifyToken(req);
    if (!user) return unauthorizedResponse();

    try {
        await dbConnect();
        const { email, newPassword } = await req.json();

        if (!email || !newPassword) {
            return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
        }

        const userInfo = await User.findOne({ email: new RegExp(email, 'i') });
        if (!userInfo) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const newPassHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await User.findOneAndUpdate({ email: new RegExp(email, 'i') }, { password: newPassHash });

        return NextResponse.json({ message: 'Password reset successfully' });
    } catch (error: any) {
        console.error('Error resetting password:', error);
        return NextResponse.json({ error: 'Error when trying to reset password', details: error.message }, { status: 400 });
    }
}