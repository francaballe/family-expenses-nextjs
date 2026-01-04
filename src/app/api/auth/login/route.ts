import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import moment from 'moment-timezone';

const JWT_KEY = process.env.JWT_KEY || 'your-secret-key';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        let email = body.email;
        let password = body.password;

        // Handle the custom 'qry' atob logic if present
        if (body.qry) {
            const decoded = Buffer.from(body.qry, 'base64').toString('utf-8');
            const auth = decoded.split('|');
            if (auth[0]) {
                email = auth[0];
                password = auth[1];
            }
        }

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const userInfo = await User.findOne({ email: new RegExp(email, 'i') });

        if (!userInfo) {
            return NextResponse.json({ error: 'Invalid Username' }, { status: 403 });
        }

        if (userInfo.isblocked) {
            return NextResponse.json({ error: 'Your account has been blocked. Please contact the admin to get this solved.' }, { status: 403 });
        }

        const passwordsMatch = await bcrypt.compare(password, userInfo.password);
        if (!passwordsMatch) {
            return NextResponse.json({ error: 'Invalid Password' }, { status: 403 });
        }

        const usersInGroup = await User.find({ groupid: userInfo.groupid }).select('_id firstname');

        const tokenInfo = {
            id: userInfo._id,
            email: userInfo.email,
            firstname: userInfo.firstname,
            userRoleId: userInfo.userroleid,
            isBlocked: userInfo.isblocked,
            groupid: userInfo.groupid,
            usersInGroup
        };

        const token = jwt.sign(tokenInfo, JWT_KEY, { expiresIn: '10h', noTimestamp: true });

        // Updating last login info
        const lastlogin = moment.tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY HH:mm:ss');
        await User.findByIdAndUpdate(userInfo._id, { lastlogin });

        return NextResponse.json({ token });

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login error', details: error.message }, { status: 500 });
    }
}
