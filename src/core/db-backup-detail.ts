import path from 'path';
import { DBBackupConfig } from '@/interface';
import { config } from '@/config';
import { getShortDBName } from './util';

export class DBBackupDetail {
  constructor(
    private projectName: string,
    private backupConfig: DBBackupConfig,
  ) {}

  getProjectName(): string {
    return this.projectName;
  }

  getConfig(): DBBackupConfig {
    return this.backupConfig;
  }

  getBackupFolderPath(): string {
    const { name, type } = this.backupConfig;
    const backupFolderPath = path.join(
      config.app.storagePath,
      this.projectName,
      `${getShortDBName(type)}_${name}`,
    );

    return backupFolderPath;
  }
}
