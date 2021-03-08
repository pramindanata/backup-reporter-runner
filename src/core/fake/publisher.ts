import { BasePublisher, FailedReport, SuccessReport } from '@/interface';

export class FakePublisher implements BasePublisher {
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
