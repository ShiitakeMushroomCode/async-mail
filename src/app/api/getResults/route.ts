import { emailQueue, failedQueue } from '@/lib/queue.server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const completedJobs = await emailQueue.getCompleted();
    const completedResults = completedJobs.map((job) => ({
      id: job.id,
      email: job.data.to,
      status: 'Completed',
      timestamp: new Date(job.timestamp).toLocaleString(),
    }));

    const failedJobs = await failedQueue.getJobs(['failed']);
    const failedResults = failedJobs.map((job) => ({
      id: job.data.id,
      email: job.data.to,
      status: `Failed: ${job.data.error}`,
      timestamp: new Date(job.timestamp).toLocaleString(),
    }));

    const allResults = [...completedResults, ...failedResults];
    return NextResponse.json(allResults);
  } catch (error) {
    console.error('Failed to fetch results:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
