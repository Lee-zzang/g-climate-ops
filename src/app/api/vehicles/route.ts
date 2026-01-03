import { NextRequest, NextResponse } from 'next/server';
import { getVehicles, updateVehicleStatus, updateVehicleLocation } from '@/lib/supabase-api';
import type { OperationMode, VehicleStatus } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = (searchParams.get('mode') || 'winter') as OperationMode;

    const vehicles = await getVehicles(mode);

    return NextResponse.json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, assignedZoneId, lat, lng } = body as {
      id: string;
      status?: VehicleStatus;
      assignedZoneId?: string | null;
      lat?: number;
      lng?: number;
    };

    let vehicle;
    if (lat !== undefined && lng !== undefined) {
      vehicle = await updateVehicleLocation(id, lat, lng);
    } else if (status) {
      vehicle = await updateVehicleStatus(id, status, assignedZoneId);
    }

    return NextResponse.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}
