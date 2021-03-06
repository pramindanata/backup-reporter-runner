import path from 'path';
import { CronJob } from 'cron';
import { injectable } from 'tsyringe';
import { access, mkdir, readdir, unlink } from 'fs/promises';
import { DBBackupDetail, OnJobError, ServerDetail } from '@/interface';
import { DBZipper } from './db-zipper';
import { PGDumpRunner } from './pg-dump-runner';
import { Publisher } from './publisher';
import { generateBaseFileName, generateFullStoragePath } from './util';

@injectable()
export class BackupRunnerJobFactory {
  constructor(
    private pgDumpRunner: PGDumpRunner,
    private dbZipper: DBZipper,
    private publisher: Publisher,
  ) {}

  create(
    serverDetail: ServerDetail,
    projectName: string,
    dbBackupDetail: DBBackupDetail,
    onJobError: OnJobError,
  ): CronJob {
    const job = new CronJob(dbBackupDetail.backupSchedule, async () =>
      this.handleJob(serverDetail, projectName, dbBackupDetail, onJobError),
    );

    return job;
  }

  private async handleJob(
    serverDetail: ServerDetail,
    projectName: string,
    dbBackupDetail: DBBackupDetail,
    onJobError: OnJobError,
  ) {
    const startedAt = new Date();
    const baseFileName = generateBaseFileName();
    const fullStoragePath = generateFullStoragePath(
      projectName,
      dbBackupDetail.name,
      dbBackupDetail.type,
    );

    try {
      await this.checkAndCreateStorageFolder(fullStoragePath);

      const dbFileDetail = await this.pgDumpRunner.dump({
        dbBackupDetail,
        fullStoragePath,
        baseFileName,
      });

      const zipFileDetail = await this.dbZipper.zip({
        dbFileDetail,
        fullStoragePath,
        baseFileName,
      });

      await unlink(dbFileDetail.filePath);

      const finishedAt = new Date();

      await this.publisher.sendSuccessReport({
        computerName: serverDetail.computerName,
        projectName: projectName,
        ip: serverDetail.ip,
        startedAt: startedAt,
        finishedAt: finishedAt,
        detail: {
          name: dbBackupDetail.name,
          type: dbBackupDetail.type,
          filePath: zipFileDetail.filePath,
          fileSize: zipFileDetail.fileSize,
        },
      });
    } catch (error) {
      if (!error.isAxiosError) {
        await this.removeCreatedFilesAfterFailed(baseFileName, fullStoragePath);
      }

      await this.publisher.sendFailedReport({
        computerName: serverDetail.computerName,
        projectName: projectName,
        ip: serverDetail.ip,
        startedAt: startedAt,
        detail: {
          message: error.message,
          name: dbBackupDetail.name,
          type: dbBackupDetail.type,
        },
      });

      onJobError(error);
    }
  }

  private async checkAndCreateStorageFolder(
    fullStoragePath: string,
  ): Promise<void> {
    try {
      await access(fullStoragePath);
    } catch (err) {
      await mkdir(fullStoragePath, {
        recursive: true,
      });
    }
  }

  private async removeCreatedFilesAfterFailed(
    baseFileName: string,
    fullStoragePath: string,
  ): Promise<void> {
    const files = await readdir(fullStoragePath);
    const unusedFiles = files.filter((file) => file.match(`${baseFileName}*`));

    await Promise.all(
      unusedFiles.map(async (file) => {
        const filePath = path.join(fullStoragePath, file);

        await unlink(filePath);
      }),
    );
  }
}
