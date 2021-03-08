import { CronJob } from 'cron';
import { container } from '@/container';
import { OnJobError } from '@/interface';
import { BackupCleaner } from './backup-cleaner';
import { DBBackupDetail } from './db-backup-detail';

export class BackupCleanerJobFactory {
  create(dbBackupDetails: DBBackupDetail[], onJobError: OnJobError): CronJob {
    const schedulePerDay = '0 0 * * *';
    const cleaner = container.resolve(BackupCleaner);
    const job = new CronJob(schedulePerDay, async () => {
      try {
        await cleaner.clean(dbBackupDetails);
      } catch (err) {
        onJobError(err);
      }
    });

    return job;
  }
}
