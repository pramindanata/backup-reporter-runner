import { CronJob } from 'cron';
import { injectable } from 'tsyringe';
import { createReadStream } from 'fs';
import { access, mkdir } from 'fs/promises';

import { config } from '@/config';
import { DBFileRemover } from '@/core/db-file-remover';
import { DBZipper } from '@/core/db-zipper';
import { PosgreSQLRunner } from '@/core/pg-runner';
import {
  generateBaseFileName,
  generateFullStoragePath,
  getShortDBName,
} from '@/core/util';
import { DBBackupDetail } from '@/interface';
import { DBType } from '@/constant';

@injectable()
export class Main {
  constructor(
    private pgRunner: PosgreSQLRunner,
    private dbZipper: DBZipper,
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
      try {
        await this.handleJob(projectName, dbBackupDetail);
      } catch (err) {
        // Send fail notification
      }
    });

    return job;
  }

  private async handleJob(
    projectName: string,
    dbBackupDetail: DBBackupDetail,
  ): Promise<void> {
    const fullStoragePath = generateFullStoragePath(
      projectName,
      dbBackupDetail.name,
      dbBackupDetail.type,
    );

    await this.checkAndCreateStorageFolder(fullStoragePath);

    const baseFileName = generateBaseFileName();
    const dbFileInfo = await this.pgRunner.execute({
      dbBackupDetail,
      fullStoragePath,
      baseFileName,
    });

    await this.dbZipper.execute({
      dbFileName: dbFileInfo.fileName,
      dbFileStream: createReadStream(dbFileInfo.filePath),
      fullStoragePath,
      baseFileName,
    });

    await this.dbFileRemover.execute(dbFileInfo.filePath);
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
