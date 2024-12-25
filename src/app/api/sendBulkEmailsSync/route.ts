import transporter from '@/lib/mail';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { emails, subject, text } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Invalid email list' }, { status: 400 });
    }

    const sendStart = Date.now();

    // 동기 방식: 한 번에 직접 발송
    for (const email of emails) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject,
        text,
      });
    }

    const sendEnd = Date.now();
    const sendTime = sendEnd - sendStart;

    return NextResponse.json({
      message: 'Emails sent successfully',
      sendTime,
    });
  } catch (error) {
    console.error('Failed to send emails:', error);
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}
