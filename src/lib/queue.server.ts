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
  async (job: Job<{ to: string; subject: string; text: string }>) => {
    try {
      console.log('Processing job:', job.data);

      // 이메일 발송
      const info = await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: job.data.to,
        subject: job.data.subject,
        text: job.data.text,
      });

      console.log('Email sent successfully:', info.messageId);
    } catch (error) {
      console.error(`Failed to send email for job ID: ${job.id}`, error);

      // 실패한 작업을 실패 큐에 추가
      await failedQueue.add('failed-email', {
        id: job.id,
        to: job.data.to,
        subject: job.data.subject,
        text: job.data.text,
        timestamp: new Date().toISOString(),
      });

      throw error; // BullMQ에 실패 상태 기록
    }
  },
  { connection }
);

// Worker 이벤트 리스너
emailWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err);
});

console.log('Email worker is running...');

export { emailQueue, failedQueue };
