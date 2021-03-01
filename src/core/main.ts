import { CronJob } from 'cron';
import { injectable } from 'tsyringe';
import { createReadStream } from 'fs';
import { access, mkdir } from 'fs/promises';

import { config } from '@/config';
import { DBFileRemover } from '@/core/db-file-remover';
import { DBZipper } from '@/core/db-zipper';
import { PosgreSQLRunner } from '@/core/pg-runner';
import { Publisher } from '@/core/publisher';
import {
  generateBaseFileName,
  generateFullStoragePath,
  getShortDBName,
} from '@/core/util';
import { BackupResultDetail, DBBackupDetail } from '@/interface';
import { DBType } from '@/constant';

@injectable()
export class Main {
  constructor(
    private pgRunner: PosgreSQLRunner,
    private dbZipper: DBZipper,
    private publisher: Publisher,
    private dbFileRemover: DBFileRemover,
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

      try {
        const backupResult = await this.backup(projectName, dbBackupDetail);
        const finishedAt = new Date();

        await this.publisher.sendSuccessReport({
          projectName,
          startedAt,
          finishedAt,
          ...backupResult,
        });
      } catch (error) {
        await this.publisher.sendFailedReport({
          projectName,
          error,
          dbBackupDetail,
          startedAt,
        });
      }
    });

    return job;
  }

  private async backup(
    projectName: string,
    dbBackupDetail: DBBackupDetail,
  ): Promise<BackupResultDetail> {
    const fullStoragePath = generateFullStoragePath(
      projectName,
      dbBackupDetail.name,
      dbBackupDetail.type,
    );

    await this.checkAndCreateStorageFolder(fullStoragePath);

    const baseFileName = generateBaseFileName();
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

    await this.dbFileRemover.execute(dbFileDetail.filePath);

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
}
