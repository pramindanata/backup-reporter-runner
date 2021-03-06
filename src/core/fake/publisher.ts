import { FailedReport, SuccessReport } from '@/interface';
import { Publisher } from '../publisher';

export class FakePublisher implements Publisher {
  async sendSuccessReport(report: SuccessReport): Promise<void> {
    console.log('Success Report', {
      ...report,
      startedAt: report.startedAt.toISOString(),
      finishedAt: report.finishedAt.toISOString(),
    });
  }

  async sendFailedReport(report: FailedReport): Promise<void> {
    console.log('Failed Report', {
      ...report,
      startedAt: report.startedAt.toISOString(),
    });
  }
}
