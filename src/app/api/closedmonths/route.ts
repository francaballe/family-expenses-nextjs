import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyToken, unauthorizedResponse } from '@/lib/auth';
import sendEmail from '@/lib/sendEmail';

// Función para asegurar que los modelos estén registrados
async function ensureModelsRegistered() {
    const ClosedMonth = (await import('@/models/ClosedMonth')).default;
    return { ClosedMonth };
}

export async function GET(req: NextRequest) {
    const user = verifyToken(req);
    if (!user) return unauthorizedResponse();

    try {
        await dbConnect();
        const { ClosedMonth } = await ensureModelsRegistered();
        
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
        const { ClosedMonth } = await ensureModelsRegistered();
        
        const data = await req.json();
        
        // Create the closed month
        const newClosedMonth = await ClosedMonth.create(data);
        
        // Send email notification
        try {
            await sendEmail(data);
            console.log('Email sent successfully for closed month:', data.monthandyear);
        } catch (emailError) {
            console.error('Failed to send email for closed month:', emailError);
            // Don't fail the request if email fails, just log it
        }
        
        return NextResponse.json(newClosedMonth);
    } catch (error: any) {
        console.error('Error creating closed month:', error);
        return NextResponse.json({ error: 'Error when trying to create closed month', details: error.message }, { status: 400 });
    }
}
