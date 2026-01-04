import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Group from '@/models/Group';
import { verifyToken, unauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const user = verifyToken(req);
    if (!user) return unauthorizedResponse();

    try {
        await dbConnect();
        const resp = await Group.find({});
        return NextResponse.json(resp);
    } catch (error: any) {
        console.error('Error fetching groups:', error);
        return NextResponse.json({ error: 'Error when trying to get groups', details: error.message }, { status: 400 });
    }
}

export async function POST(req: NextRequest) {
    const user = verifyToken(req);
    if (!user) return unauthorizedResponse();

    try {
        await dbConnect();
        const { name } = await req.json();

        const maxIdGroup = await Group.findOne().sort({ _id: -1 });
        let newId = 1;
        if (maxIdGroup) {
            newId = Number(maxIdGroup._id) + 1;
        }

        const newGroup = await Group.create({ name, _id: newId });
        return NextResponse.json(newGroup);
    } catch (error: any) {
        console.error('Error creating group:', error);
        return NextResponse.json({ error: 'Error when trying to create group', details: error.message }, { status: 400 });
    }
}
