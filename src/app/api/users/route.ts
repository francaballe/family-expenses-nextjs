import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyToken, unauthorizedResponse } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import moment from 'moment-timezone';
import mongoose from 'mongoose';

const SALT_ROUNDS = process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10;

// Función para asegurar que los modelos estén registrados
async function ensureModelsRegistered() {
    // Importar dinámicamente los modelos para evitar problemas de registro
    const User = (await import('@/models/User')).default;
    const Group = (await import('@/models/Group')).default;
    const Role = (await import('@/models/Role')).default;
    
    return { User, Group, Role };
}

export async function GET(req: NextRequest) {
    const user = verifyToken(req);
    if (!user) return unauthorizedResponse();

    try {
        await dbConnect();
        const { User, Group, Role } = await ensureModelsRegistered();
        
        const { searchParams } = new URL(req.url);
        const groupid = searchParams.get('groupid') ? parseInt(searchParams.get('groupid')!) : null;

        let findOption = {};
        if (groupid) findOption = { groupid };

        const resp = await User.find(findOption)
            .select('-password')
            .populate('userroleid')
            .populate('groupid');

        return NextResponse.json(resp);
    } catch (error: any) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Error when trying to get users', details: error.message }, { status: 400 });
    }
}

export async function POST(req: NextRequest) {
    const user = verifyToken(req);
    if (!user) return unauthorizedResponse();

    try {
        await dbConnect();
        const { User } = await ensureModelsRegistered();
        
        const data = await req.json();
        const { firstname, lastname, email, password, userroleid, groupid } = data;

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const createdAt = moment.tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY HH:mm:ss');

        const creationData = {
            firstname,
            lastname,
            email,
            password: hashedPassword,
            userroleid,
            groupid,
            createdAt
        };

        const newUser = await User.create(creationData);
        return NextResponse.json(newUser);
    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Error when trying to create user', details: error.message }, { status: 400 });
    }
}

export async function PUT(req: NextRequest) {
    const user = verifyToken(req);
    if (!user) return unauthorizedResponse();

    try {
        await dbConnect();
        const { User } = await ensureModelsRegistered();
        
        const data = await req.json();
        const { _id, firstname, lastname, email, userroleid, isblocked, groupid } = data;

        const editObj: any = {};
        if (firstname) editObj.firstname = firstname;
        if (lastname) editObj.lastname = lastname;
        if (email) editObj.email = email;
        if (userroleid) editObj.userroleid = userroleid;
        if (groupid) editObj.groupid = groupid;
        editObj.isblocked = !!isblocked;

        const updatedUser = await User.findByIdAndUpdate(_id, editObj, { returnDocument: 'after' });
        return NextResponse.json(updatedUser);
    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Error when trying to update user', details: error.message }, { status: 400 });
    }
}

export async function PATCH(req: NextRequest) {
    const user = verifyToken(req);
    if (!user) return unauthorizedResponse();

    try {
        await dbConnect();
        const { User } = await ensureModelsRegistered();
        
        const { email, currentPassword, newPassword } = await req.json();

        const userInfo = await User.findOne({ email: new RegExp(email, 'i') });
        if (!userInfo) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const passwordsMatch = await bcrypt.compare(currentPassword, userInfo.password);
        if (!passwordsMatch) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        const newPassHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        const updatedUser = await User.findOneAndUpdate({ email: new RegExp(email, 'i') }, { password: newPassHash });

        return NextResponse.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        console.error('Error updating password:', error);
        return NextResponse.json({ error: 'Error when trying to update password', details: error.message }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest) {
    const user = verifyToken(req);
    if (!user) return unauthorizedResponse();

    try {
        await dbConnect();
        const { User } = await ensureModelsRegistered();
        
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        await User.findByIdAndDelete(userId);
        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Error when trying to delete user', details: error.message }, { status: 400 });
    }
}