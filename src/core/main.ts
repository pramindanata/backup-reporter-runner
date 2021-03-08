import { injectable } from 'tsyringe';
import { config } from '@/config';
import { getServerDetail } from '@/core/util';
import { BackupRunnerJobFactory } from '@/core/backup-runner-job-factory';
import { OnJobError, ProjectConfig, ServerDetail } from '@/interface';
import { DBBackupDetail } from './db-backup-detail';

@injectable()
export class Main {
  private dbBackupDetails: DBBackupDetail[] = [];

  constructor(private backupRunnerJobFactory: BackupRunnerJobFactory) {}

  async execute(onJobError: OnJobError): Promise<void> {
    const { projects } = config;
    const serverDetail = await getServerDetail();

    this.registerDBBackupDetails(projects);
    this.initBackupRunnerJobs(serverDetail, onJobError);

    console.log('[x] Runner ready');
  }

  private registerDBBackupDetails(projects: ProjectConfig[]): void {
    projects.forEach((project) => {
      project.databases.forEach((dbBackupConfig) => {
        const projectName = project.name;
        const dbBackupDetail = new DBBackupDetail(projectName, dbBackupConfig);

        this.dbBackupDetails.push(dbBackupDetail);

        console.log(
          `[x] "${projectName}"."${dbBackupConfig.type}"."${dbBackupConfig.name}" registered`,
        );
      });
    });
  }

  private initBackupRunnerJobs(
    serverDetail: ServerDetail,
    onJobError: OnJobError,
  ): void {
    this.dbBackupDetails.forEach((dbBackupDetail) => {
      const job = this.backupRunnerJobFactory.create(
        serverDetail,
        dbBackupDetail,
        onJobError,
      );

      job.start();
    });
  }
}
