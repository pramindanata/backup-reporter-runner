import { CronJob } from 'cron';
import { injectable } from 'tsyringe';
import { createReadStream } from 'fs';
import path from 'path';
import { access, mkdir, readdir, unlink } from 'fs/promises';

import { config } from '@/config';
import { DBZipper } from '@/core/db-zipper';
import { PosgreSQLRunner } from '@/core/pg-runner';
import { Publisher } from '@/core/publisher';
import {
  generateBaseFileName,
  generateFullStoragePath,
  getShortDBName,
} from '@/core/util';
import {
  BackupResultDetail,
  DBBackupDetail,
  FailedReport,
  SuccessReport,
} from '@/interface';
import { DBType } from '@/constant';

@injectable()
export class Main {
  constructor(
    private pgRunner: PosgreSQLRunner,
    private dbZipper: DBZipper,
    private publisher: Publisher,
  ) {}

  async execute(): Promise<void> {
    const { projects } = config;

    projects.forEach((project) => {
      project.databases.forEach((dbBackupDetail) => {
        const projectName = project.name;
        const dbCode = getShortDBName(dbBackupDetail.type);
        const dbName = dbBackupDetail.name;
        const logLabel = `[${projectName}][${dbCode}][${dbName}]`;

        if (dbBackupDetail.type !== DBType.POSTGRESQL) {
          console.warn(
            `${logLabel} ${dbBackupDetail.type} currently is not supported !`,
          );

          return;
        }

        const job = this.createJob(project.name, dbBackupDetail);

        job.start();

        console.log(`${logLabel} Registered`);
      });
    });
  }

  private createJob(
    projectName: string,
    dbBackupDetail: DBBackupDetail,
  ): CronJob {
    const job = new CronJob(dbBackupDetail.backupSchedule, async () => {
      const startedAt = new Date();
      const baseFileName = generateBaseFileName();
      const fullStoragePath = generateFullStoragePath(
        projectName,
        dbBackupDetail.name,
        dbBackupDetail.type,
      );

      try {
        const backupResult = await this.backup(
          baseFileName,
          fullStoragePath,
          dbBackupDetail,
        );
        const finishedAt = new Date();
        const successReport: SuccessReport = {
          projectName,
          startedAt,
          finishedAt,
          dbBackupDetail,
          zipFileDetail: backupResult.zipFileDetail,
        };

        await this.publisher.sendSuccessReport(successReport);
      } catch (error) {
        if (!error.isAxiosError) {
          await this.removeCreatedFilesAfterFailed(
            baseFileName,
            fullStoragePath,
          );
        }

        const failedReport: FailedReport = {
          projectName,
          error,
          dbBackupDetail,
          startedAt,
        };

        await this.publisher.sendFailedReport(failedReport);
      }
    });

    return job;
  }

  private async backup(
    baseFileName: string,
    fullStoragePath: string,
    dbBackupDetail: DBBackupDetail,
  ): Promise<BackupResultDetail> {
    await this.checkAndCreateStorageFolder(fullStoragePath);

    const dbFileDetail = await this.pgRunner.execute({
      dbBackupDetail,
      fullStoragePath,
      baseFileName,
    });

    const zipFileDetail = await this.dbZipper.execute({
      dbFileName: dbFileDetail.fileName,
      dbFileStream: createReadStream(dbFileDetail.filePath),
      fullStoragePath,
      baseFileName,
    });

    await unlink(dbFileDetail.filePath);

    return {
      dbFileDetail,
      zipFileDetail,
    };
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
