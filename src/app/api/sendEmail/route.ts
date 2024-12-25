import { emailQueue } from '@/lib/queue.server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { to, subject, text } = await req.json();

    // 입력 데이터 검증
    if (!to || !subject || !text) {
      return NextResponse.json(
        { error: 'Invalid email data: to, subject, and text are required.' },
        { status: 400 }
      );
    }

    // 큐에 작업 추가
    await emailQueue.add('send-email', { to, subject, text });

    return NextResponse.json({ message: 'Email queued successfully' });
  } catch (error) {
    console.error('Failed to queue email:', error);
    return NextResponse.json({ error: 'Failed to queue email' }, { status: 500 });
  }
}
