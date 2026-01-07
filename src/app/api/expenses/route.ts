import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyToken, unauthorizedResponse } from '@/lib/auth';
import mongoose from 'mongoose';

// Función para asegurar que los modelos estén registrados
async function ensureModelsRegistered() {
    const Expense = (await import('@/models/Expense')).default;
    const User = (await import('@/models/User')).default;
    
    return { Expense, User };
}

export async function GET(req: NextRequest) {
    const user = verifyToken(req);
    if (!user) return unauthorizedResponse();

    try {
        await dbConnect();
        const { Expense, User } = await ensureModelsRegistered();
        
        const { searchParams } = new URL(req.url);
        const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null;
        const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null;
        const groupid = searchParams.get('groupid') ? parseInt(searchParams.get('groupid')!) : null;

        const searchCriteria: any = {};
        const dateOptions: any[] = [];

        if (year) {
            dateOptions.push({ $eq: [{ $year: '$expensedate' }, year] });
        }
        if (month) {
            dateOptions.push({ $eq: [{ $month: '$expensedate' }, month] });
        }
        if (dateOptions.length) {
            searchCriteria['$expr'] = { $and: dateOptions };
        }

        if (groupid) {
            const usersInGroup = await User.find({ groupid }).select('_id');
            if (usersInGroup.length > 0) {
                const userIds = usersInGroup.map(u => u._id);
                searchCriteria['userid'] = { $in: userIds };
            }
        }

        const resp = await Expense.find(searchCriteria).select('-_id');
        return NextResponse.json(resp);
    } catch (error: any) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json({ error: 'Error when trying to get expenses', details: error.message }, { status: 400 });
    }
}

export async function POST(req: NextRequest) {
    const user = verifyToken(req);
    if (!user) return unauthorizedResponse();

    try {
        await dbConnect();
        const { Expense } = await ensureModelsRegistered();
        
        const data = await req.json();

        if (Array.isArray(data) && data.length) {
            const newExpenses = await Expense.create(data);
            return NextResponse.json(newExpenses);
        } else {
            return NextResponse.json({ error: 'Data must be a non-empty array' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Error creating expenses:', error);
        return NextResponse.json({ error: 'Error when trying to create expenses', details: error.message }, { status: 400 });
    }
}
