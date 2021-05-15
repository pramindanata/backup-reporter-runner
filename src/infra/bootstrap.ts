import { CronJob } from 'cron';
import { BackupTask } from '@/adapter';
import { Database } from '@/domain';
import { ConfigHelper } from './helpers';
import { container } from './providers';

export function bootstrap(): void {
  const configHelper = container.resolve(ConfigHelper);
  const projectsConfig = configHelper.get('projects');
  const databases: Database[] = [];

  projectsConfig.forEach((projectConfig) => {
    projectConfig.databases.forEach((databaseConfig) => {
      const database = new Database({
        ...databaseConfig,
        project: { name: projectConfig.name },
      });

      databases.push(database);
    });
  });

  const backupTask = container.resolve(BackupTask);
  const backupCronJobs = databases.map((database) => {
    return new CronJob(database.backupSchedule, () =>
      backupTask.execute(database),
    );
  });

  for (const cronJob of backupCronJobs) {
    cronJob.start();
  }

  console.log('[X] Runner ready');
}
