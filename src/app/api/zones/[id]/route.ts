import { NextRequest, NextResponse } from 'next/server';
import { getRiskZoneById, updateRiskZoneStatus } from '@/lib/supabase-api';
import type { RiskStatus } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const zone = await getRiskZoneById(id);

    return NextResponse.json({
      success: true,
      data: zone,
    });
  } catch (error) {
    console.error('Error fetching risk zone:', error);
    return NextResponse.json(
      { success: false, error: 'Risk zone not found' },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body as { status: RiskStatus };

    const zone = await updateRiskZoneStatus(id, status);

    return NextResponse.json({
      success: true,
      data: zone,
    });
  } catch (error) {
    console.error('Error updating risk zone:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update risk zone' },
      { status: 500 }
    );
  }
}
