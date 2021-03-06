import { injectable } from 'tsyringe';
import { config } from '@/config';
import { DBType } from '@/constant';
import { getServerDetail, getShortDBName } from '@/core/util';
import { BackupRunnerJobFactory } from '@/core/backup-runner-job-factory';
import { OnJobError } from '@/interface';

@injectable()
export class Main {
  constructor(private backupRunnerJobFactory: BackupRunnerJobFactory) {}

  async execute(onJobError: OnJobError): Promise<void> {
    const { projects } = config;
    const serverDetail = await getServerDetail();

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

        const job = this.backupRunnerJobFactory.create(
          serverDetail,
          projectName,
          dbBackupDetail,
          onJobError,
        );

        job.start();

        console.log(`${logLabel} Registered`);
      });
    });
  }
}
