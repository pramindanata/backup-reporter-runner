import { inject, singleton } from 'tsyringe';
import path from 'path';
import { BackupFolderHelperContract, ConfigHelperContract } from '@/contract';
import { Database } from '@/domain';
import { Token } from '@/common';

@singleton()
export class BackupFolderHelper implements BackupFolderHelperContract {
  constructor(
    @inject(Token.ConfigHelper)
    private configHelper: ConfigHelperContract,
  ) {}

  createPath(database: Database): string {
    const storagePath = this.configHelper.get('app.storagePath');
    const backupFolderPath = path.join(
      storagePath,
      database.getProject().name,
      `${database.getShortDbName()}`,
    );

    return backupFolderPath;
  }
}
