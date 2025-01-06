import { emailQueue, failedQueue } from '@/lib/queue.server';
import { NextResponse } from 'next/server';


export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const testId = url.searchParams.get('testId');

    if (!testId) {
      console.error('getResults API 호출 시 testId가 제공되지 않았습니다.');
      return NextResponse.json({ error: 'testId is required' }, { status: 400 });
    }

    console.log(`getResults API 호출됨. testId: ${testId}`);

    // 완료된 작업 중 testId에 해당하는 것 찾기
    const completedJobs = await emailQueue.getCompleted(0, -1);
    const completedJob = completedJobs.find((job) => job.data.testId === testId);

    // 실패한 작업 중 testId에 해당하는 것 찾기
    const failedJobs = await failedQueue.getJobs(['failed'], 0, -1, true);
    const failedJob = failedJobs.find((job) => job.data.testId === testId);

    if (completedJob) {
      console.log(`완료된 작업 발견: Job ID ${completedJob.id}`);
      return NextResponse.json({
        status: 'Completed',
        enqueueTime: completedJob.timestamp ? new Date(completedJob.timestamp).toLocaleString() : 'N/A',
        processingTime: completedJob.returnvalue?.processingTime || 'N/A',
      });
    }

    if (failedJob) {
      console.log(`실패한 작업 발견: Job ID ${failedJob.id}`);
      return NextResponse.json({
        status: `Failed: ${failedJob.data.error}`,
        enqueueTime: failedJob.timestamp ? new Date(failedJob.timestamp).toLocaleString() : 'N/A',
        processingTime: 'N/A',
      });
    }

    console.log(`작업이 아직 처리 중입니다: testId ${testId}`);
    return NextResponse.json({ status: 'Processing', enqueueTime: 'N/A', processingTime: 'N/A' });
  } catch (error) {
    console.error('getResults API 처리 중 오류 발생:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}