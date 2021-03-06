import { injectable } from 'tsyringe';
import { axios } from '@/lib/axios';
import { FailedReport, SuccessReport } from '@/interface';
import { config } from '@/config';

@injectable()
export class Publisher {
  async sendSuccessReport(report: SuccessReport): Promise<void> {
    await axios.post(`${config.bot.url}/report/success`, {
      ...report,
      startedAt: report.startedAt.toISOString(),
      finishedAt: report.finishedAt.toISOString(),
    });
  }

  async sendFailedReport(report: FailedReport): Promise<void> {
    await axios.post(`${config.bot.url}/report/failed`, {
      ...report,
      startedAt: report.startedAt.toISOString(),
    });
  }
}
