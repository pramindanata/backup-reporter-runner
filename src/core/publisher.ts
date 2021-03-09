import { injectable } from 'tsyringe';
import { axios } from '@/lib/axios';
import { BasePublisher, FailedReport, SuccessReport } from '@/interface';

@injectable()
export class Publisher implements BasePublisher {
  async sendSuccessReport(report: SuccessReport): Promise<void> {
    await axios.post('/report/success', {
      ...report,
      startedAt: report.startedAt.toISOString(),
      finishedAt: report.finishedAt.toISOString(),
    });
  }

  async sendFailedReport(report: FailedReport): Promise<void> {
    await axios.post('/report/failed', {
      ...report,
      startedAt: report.startedAt.toISOString(),
    });
  }
}
