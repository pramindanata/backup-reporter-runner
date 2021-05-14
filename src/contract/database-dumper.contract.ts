import { DumpedFileDetail } from '@/common';
import { Database } from '@/domain';

export interface DatabaseDumperContract {
  dump(options: DatabaseDumperDumpOptions): Promise<DumpedFileDetail>;
}

export interface DatabaseDumperDumpOptions {
  database: Database;
  dumpFolderPath: string;
  baseFileName: string;
}
