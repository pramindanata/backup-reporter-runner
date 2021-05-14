import { Database } from '@/domain';

export interface BackupFolderHelperContract {
  createPath(database: Database): string;
}
