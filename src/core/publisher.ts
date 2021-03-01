import { injectable } from 'tsyringe';
import { axios } from '@/lib/axios';
import { FailedReport, SuccessReport } from '@/interface';
import { getServerDetail } from '@/core/util';

@injectable()
export class Publisher {
  async sendSuccessReport(report: SuccessReport): Promise<void> {
    const serverDetail = await getServerDetail();
    const {
      dbFileDetail,
      zipFileDetail,
      finishedAt,
      projectName,
      startedAt,
    } = report;

    console.log({
      serverDetail,
      projectName,
      startedAt,
      finishedAt,
      dbFileDetail,
      zipFileDetail,
    });
  }

  async sendFailedReport(report: FailedReport): Promise<void> {
    const serverDetail = await getServerDetail();
    const { dbBackupDetail, error, projectName, startedAt } = report;

    console.log({
      serverDetail,
      projectName,
      message: error.message,
      dbBackupDetail,
      startedAt,
    });
  }
}
