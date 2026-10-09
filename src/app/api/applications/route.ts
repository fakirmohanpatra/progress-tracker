import { NextResponse } from 'next/server';
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from '@/lib/db';
import { ApplicationStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') as ApplicationStatus) || undefined;
    const search = searchParams.get('search') || undefined;

    const applications = await getApplications({ status, search });
    return NextResponse.json({ applications, count: applications.length });
  } catch (error) {
    console.error('Failed to get applications:', error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to fetch applications', details }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.company || !body.company.trim()) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const application = await createApplication(body);
    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Failed to create application:', error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to create application', details }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = body.id;
    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const updated = await updateApplication(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ application: updated });
  } catch (error) {
    console.error('Failed to update application:', error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to update application', details }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const success = await deleteApplication(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Failed to delete application:', error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to delete application', details }, { status: 500 });
  }
}
