import { NextResponse } from 'next/server';
import { getApplicationById, updateApplication, deleteApplication } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const application = await getApplicationById(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    return NextResponse.json({ application });
  } catch (error) {
    console.error('Failed to get application:', error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to get application', details }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const updated = await updateApplication(id, updates);
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteApplication(id);
    if (!success) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete application:', error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to delete application', details }, { status: 500 });
  }
}
