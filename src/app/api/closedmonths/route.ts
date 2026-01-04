import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ClosedMonth from '@/models/ClosedMonth';
import { verifyToken, unauthorizedResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const user = verifyToken(req);
    if (!user) return unauthorizedResponse();

    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const year = searchParams.get('year');
        const month = searchParams.get('month');
        const groupid = searchParams.get('groupid') ? parseInt(searchParams.get('groupid')!) : null;
        const last = searchParams.get('last') === 'true';

        if (last) {
            if (!groupid) return NextResponse.json({ error: 'groupid is required for last closed month' }, { status: 400 });
            const allClosedMonths = await ClosedMonth.find({ groupid });
            const sortedMonths = allClosedMonths.sort((a, b) => {
                const dateA = new Date(`${a.monthandyear.slice(2)}-${a.monthandyear.slice(0, 2)}-01`);
                const dateB = new Date(`${b.monthandyear.slice(2)}-${b.monthandyear.slice(0, 2)}-01`);
                return dateB.getTime() - dateA.getTime();
            });
            return NextResponse.json(sortedMonths[0] || null);
        }

        const searchCriteria: any = {};
        if (year && month) {
            searchCriteria['monthandyear'] = month + year;
        }
        if (groupid) {
            searchCriteria['groupid'] = groupid;
        }

        const resp = await ClosedMonth.find(searchCriteria);
        return NextResponse.json(resp);
    } catch (error: any) {
        console.error('Error fetching closed months:', error);
        return NextResponse.json({ error: 'Error when trying to get closed month', details: error.message }, { status: 400 });
    }
}

export async function POST(req: NextRequest) {
    const user = verifyToken(req);
    if (!user) return unauthorizedResponse();

    try {
        await dbConnect();
        const data = await req.json();
        const newClosedMonth = await ClosedMonth.create(data);
        return NextResponse.json(newClosedMonth);
    } catch (error: any) {
        console.error('Error creating closed month:', error);
        return NextResponse.json({ error: 'Error when trying to create closed month', details: error.message }, { status: 400 });
    }
}
