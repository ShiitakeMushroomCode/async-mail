import { emailQueue } from '@/lib/queue.server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { emails, subject, text } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Invalid email list' }, { status: 400 });
    }

    const enqueueStart = Date.now();

    // 비동기 방식: 큐에 작업 추가
    await Promise.all(
      emails.map((email) =>
        emailQueue.add('send-email', { to: email, subject, text })
      )
    );

    const enqueueEnd = Date.now();
    const enqueueTime = enqueueEnd - enqueueStart;

    return NextResponse.json({
      message: 'Emails queued successfully',
      enqueueTime,
    });
  } catch (error) {
    console.error('Failed to queue emails:', error);
    return NextResponse.json({ error: 'Failed to queue emails' }, { status: 500 });
  }
}
