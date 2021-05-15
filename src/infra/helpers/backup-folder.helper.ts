import { singleton } from 'tsyringe';
import path from 'path';
import { BackupFolderHelperContract } from '@/contract';
import { Database } from '@/domain';
import { ConfigHelper } from './config.helper';

@singleton()
export class BackupFolderHelper implements BackupFolderHelperContract {
  constructor(private configHelper: ConfigHelper) {}

  createPath(database: Database): string {
    const storagePath = this.configHelper.get('app.storagePath');
    const backupFolderPath = path.join(
      storagePath,
      database.getProject().name,
      `${database.getShortDbName()}_${database.name}`,
    );

    return backupFolderPath;
  }
}
