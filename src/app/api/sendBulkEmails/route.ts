import { emailQueue } from '@/lib/queue.server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';


export async function POST(req: Request) {
  try {
    const { emails, subject, text } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Invalid email list' }, { status: 400 });
    }

    // 고유한 테스트 ID 생성
    const testId = uuidv4();

    // 큐에 단일 작업으로 추가
    const enqueueStart = Date.now();
    await emailQueue.add('send-bulk-emails', { emails, subject, text, testId });
    const enqueueEnd = Date.now();

    const enqueueTime = enqueueEnd - enqueueStart;

    return NextResponse.json({
      message: 'Emails queued successfully',
      enqueueTime,
      testId,
    });
  } catch (error) {
    console.error('Failed to queue emails:', error);
    return NextResponse.json({ error: 'Failed to queue emails' }, { status: 500 });
  }
}