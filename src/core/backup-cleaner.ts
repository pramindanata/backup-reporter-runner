import path from 'path';
import { injectable } from 'tsyringe';
import { readdir, stat, unlink } from 'fs/promises';
import { DBBackupDetail } from './db-backup-detail';

interface CleaningTargetFile {
  path: string;
  createdAt: Date;
  daysUntilExpired: number;
}

@injectable()
export class BackupCleaner {
  private files: CleaningTargetFile[] = [];

  async clean(dbBackupDetails: DBBackupDetail[]): Promise<void> {
    const currentDate = new Date();

    await this.registerFiles(dbBackupDetails);
    await Promise.allSettled(
      this.files.map(async (file) => {
        const fileExpiredDate = this.getFileExpiredDate(file);

        if (currentDate > fileExpiredDate) {
          await unlink(file.path);
        }
      }),
    );
  }

  private async registerFiles(
    dbBackupDetails: DBBackupDetail[],
  ): Promise<void> {
    await Promise.all(
      dbBackupDetails.map(async (detail) => {
        const folderPath = detail.getBackupFolderPath();
        const config = detail.getConfig();
        const dirDetail = await readdir(folderPath);

        const files: CleaningTargetFile[] = await Promise.all(
          dirDetail.map(async (fileName) => {
            const fullPath = path.join(folderPath, fileName);
            const fileStat = await stat(fullPath);

            return {
              path: fullPath,
              createdAt: fileStat.ctime,
              daysUntilExpired: config.daysUntilExpired,
            };
          }),
        );

        this.files.push(...files);
      }),
    );
  }

  private getFileExpiredDate(file: CleaningTargetFile): Date {
    const msPerMinute = 60000;
    const minutePerHour = 60;
    const hourPerDay = 24;
    const msPerDay = msPerMinute * minutePerHour * hourPerDay;
    const fileCreatedAtTime = file.createdAt.getTime();
    const fileExpiredDate = new Date(
      fileCreatedAtTime + msPerDay * file.daysUntilExpired,
    );

    return fileExpiredDate;
  }
}
