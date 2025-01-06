import transporter from '@/lib/mail';
import { NextResponse } from 'next/server';


export async function POST(req: Request) {
  try {
    const { emails, subject, text } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Invalid email list' }, { status: 400 });
    }

    const syncStart = Date.now();

    // 동기적으로 이메일 발송
    for (const email of emails) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: subject,
        text: text,
      });
      console.log(`Email sent to ${email}`);
    }

    const syncEnd = Date.now();
    const syncTime = syncEnd - syncStart;

    return NextResponse.json({
      message: 'Emails sent synchronously successfully',
      syncTime,
    });
  } catch (error: any) {
    console.error('Failed to send emails synchronously:', error);
    return NextResponse.json({ error: 'Failed to send emails synchronously' }, { status: 500 });
  }
}