import path from 'path';
import { CronJob } from 'cron';
import { inject, injectable } from 'tsyringe';
import { access, mkdir, readdir, unlink } from 'fs/promises';
import { BasePublisher, OnJobError, ServerDetail } from '@/interface';
import { Interface } from '@/constant';
import { DBZipper } from './db-zipper';
import { PGDumpRunner } from './pg-dump-runner';
import { generateBaseFileName } from './util';
import { DBBackupDetail } from './db-backup-detail';

@injectable()
export class BackupRunnerJobFactory {
  constructor(
    private pgDumpRunner: PGDumpRunner,
    private dbZipper: DBZipper,
    @inject(Interface.BasePublisher)
    private publisher: BasePublisher,
  ) {}

  create(
    serverDetail: ServerDetail,
    dbBackupDetail: DBBackupDetail,
    onJobError: OnJobError,
  ): CronJob {
    const dbBackupConfig = dbBackupDetail.getConfig();
    const job = new CronJob(dbBackupConfig.backupSchedule, async () =>
      this.handleJob(serverDetail, dbBackupDetail, onJobError),
    );

    return job;
  }

  private async handleJob(
    serverDetail: ServerDetail,
    dbBackupDetail: DBBackupDetail,
    onJobError: OnJobError,
  ) {
    const startedAt = new Date();
    const baseFileName = generateBaseFileName();
    const dbBackupConfig = dbBackupDetail.getConfig();
    const folderPath = dbBackupDetail.getBackupFolderPath();

    try {
      await this.checkAndCreateBackupFolder(folderPath);

      const dbFileDetail = await this.pgDumpRunner.dump({
        dbBackupConfig: dbBackupDetail.getConfig(),
        folderPath,
        baseFileName,
      });

      const zipFileDetail = await this.dbZipper.zip({
        dbFileDetail,
        folderPath,
        baseFileName,
      });

      await unlink(dbFileDetail.filePath);

      const finishedAt = new Date();

      await this.publisher.sendSuccessReport({
        computerName: serverDetail.computerName,
        projectName: dbBackupDetail.getProjectName(),
        ip: serverDetail.ip,
        startedAt: startedAt,
        finishedAt: finishedAt,
        detail: {
          name: dbBackupConfig.name,
          type: dbBackupConfig.type,
          filePath: zipFileDetail.filePath,
          fileSize: zipFileDetail.fileSize,
        },
      });
    } catch (error) {
      if (!error.isAxiosError) {
        await this.removeCreatedFilesAfterFailed(baseFileName, folderPath);
      }

      await this.publisher.sendFailedReport({
        computerName: serverDetail.computerName,
        projectName: dbBackupDetail.getProjectName(),
        ip: serverDetail.ip,
        startedAt: startedAt,
        detail: {
          message: error.message,
          name: dbBackupConfig.name,
          type: dbBackupConfig.type,
        },
      });

      onJobError(error);
    }
  }

  private async checkAndCreateBackupFolder(folderPath: string): Promise<void> {
    try {
      await access(folderPath);
    } catch (err) {
      await mkdir(folderPath, {
        recursive: true,
      });
    }
  }

  private async removeCreatedFilesAfterFailed(
    baseFileName: string,
    folderPath: string,
  ): Promise<void> {
    const files = await readdir(folderPath);
    const unusedFiles = files.filter((file) => file.match(`${baseFileName}*`));

    await Promise.all(
      unusedFiles.map(async (file) => {
        const filePath = path.join(folderPath, file);

        await unlink(filePath);
      }),
    );
  }
}
