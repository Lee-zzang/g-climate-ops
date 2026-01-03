import { NextRequest, NextResponse } from 'next/server';
import { getRiskZones, getRiskSummary, createRiskZone } from '@/lib/supabase-api';
import type { OperationMode } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = (searchParams.get('mode') || 'winter') as OperationMode;

    const [zones, summary] = await Promise.all([
      getRiskZones(mode),
      getRiskSummary(mode),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        mode,
        zones,
        summary,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching risk zones:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch risk zones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const zone = await createRiskZone(body);

    return NextResponse.json({
      success: true,
      data: zone,
    });
  } catch (error) {
    console.error('Error creating risk zone:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create risk zone' },
      { status: 500 }
    );
  }
}
