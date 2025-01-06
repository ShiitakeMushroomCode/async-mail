import transporter from '@/lib/mail'; // Nodemailer 설정 파일
import { Job, Queue, Worker } from 'bullmq';

// Redis 연결 설정
const connection = {
  host: 'localhost',
  port: 6379,
};

// 이메일 발송 큐
const emailQueue = new Queue('email-queue', { connection });

// 실패 큐 생성
const failedQueue = new Queue('failed-email-queue', { connection });

// Worker 설정
const emailWorker = new Worker(
  'email-queue',
  async (job: Job<{ emails: string[]; subject: string; text: string; testId: string }>) => {
    const processingStart = Date.now();
    try {
      console.log('Processing job:', job.data);

      // 이메일 발송
      for (const email of job.data.emails) {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: email,
          subject: job.data.subject,
          text: job.data.text,
        });
        console.log(`Email sent to ${email}`);
      }

      const processingEnd = Date.now();
      const processingTime = processingEnd - processingStart;

      // 작업 완료 시 처리 시간 반환
      return { processingTime };
    } catch (error: any) {
      console.error(`Failed to send emails for job ID: ${job.id}`, error);

      // 실패한 작업을 실패 큐에 추가
      await failedQueue.add('failed-email', {
        id: job.id,
        emails: job.data.emails,
        subject: job.data.subject,
        text: job.data.text,
        error: error.message,
        timestamp: new Date().toISOString(),
        testId: job.data.testId,
      });

      throw error; // BullMQ에 실패 상태 기록
    }
  },
  { connection }
);

// Worker 이벤트 리스너
emailWorker.on('completed', (job, returnValue) => {
  console.log(`Job ${job.id} completed successfully in ${returnValue.processingTime} ms.`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err);
});

console.log('Email worker is running...');

export { emailQueue, failedQueue };
