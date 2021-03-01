import { injectable } from 'tsyringe';
import { axios } from '@/lib/axios';
import { FailedReport, SuccessReport } from '@/interface';
import { getServerDetail } from '@/core/util';
import { config } from '@/config';

@injectable()
export class Publisher {
  async sendSuccessReport(report: SuccessReport): Promise<void> {
    const serverDetail = await getServerDetail();
    const {
      zipFileDetail,
      finishedAt,
      projectName,
      startedAt,
      dbBackupDetail,
    } = report;

    await axios.post(`${config.bot.url}/report/success`, {
      status: 'Success',
      computerName: serverDetail.computerName,
      projectName: projectName,
      ip: serverDetail.ip,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      detail: {
        name: dbBackupDetail.name,
        type: dbBackupDetail.type,
        filePath: zipFileDetail.filePath,
        fileSize: zipFileDetail.fileSize,
      },
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
