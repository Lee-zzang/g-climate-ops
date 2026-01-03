import { NextRequest, NextResponse } from 'next/server';
import { getAgentMessages, createAgentMessage } from '@/lib/supabase-api';
import type { OperationMode, MessageType } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = (searchParams.get('mode') || 'winter') as OperationMode;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const messages = await getAgentMessages(mode, limit);

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, message, type, mode } = body as {
      id: string;
      message: string;
      type: MessageType;
      mode: OperationMode;
    };

    const newMessage = await createAgentMessage({ id, message, type, mode });

    return NextResponse.json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
