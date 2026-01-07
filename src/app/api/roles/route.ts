import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyToken, unauthorizedResponse } from '@/lib/auth';

// Función para asegurar que los modelos estén registrados
async function ensureModelsRegistered() {
    const Role = (await import('@/models/Role')).default;
    return { Role };
}

export async function GET(req: NextRequest) {
    const user = verifyToken(req);
    if (!user) return unauthorizedResponse();

    try {
        await dbConnect();
        const { Role } = await ensureModelsRegistered();
        
        const resp = await Role.find({});
        return NextResponse.json(resp);
    } catch (error: any) {
        console.error('Error fetching roles:', error);
        return NextResponse.json({ error: 'Error when trying to get roles', details: error.message }, { status: 400 });
    }
}

export async function POST(req: NextRequest) {
    const user = verifyToken(req);
    if (!user) return unauthorizedResponse();

    try {
        await dbConnect();
        const { Role } = await ensureModelsRegistered();
        
        const { name } = await req.json();

        const maxIdRole = await Role.findOne().sort({ _id: -1 });
        let newId = 1;
        if (maxIdRole) {
            newId = Number(maxIdRole._id) + 1;
        }

        const newRole = await Role.create({ name, _id: newId });
        return NextResponse.json(newRole);
    } catch (error: any) {
        console.error('Error creating role:', error);
        return NextResponse.json({ error: 'Error when trying to create role', details: error.message }, { status: 400 });
    }
}
