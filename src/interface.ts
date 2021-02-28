import { ReadStream } from 'fs';
import { DBType } from '@/constant';

export interface Config {
  app: {
    compressionLevel: number;
    storagePath: string;
  };
  bot: {
    url: string;
  };
  projects: ProjectDetail[];
}

export interface ProjectDetail {
  name: string;
  databases: DBBackupDetail[];
}

export interface DBBackupDetail {
  type: DBType;
  name: string;
  host: string;
  port: number;
  user: string;
  password: string;
  backupSchedule: string;
  maxDaysFileStored: number;
}

export interface DBRunner {
  execute(options: DBRunnerExecuteOptions): Promise<DBFileInfo>;
}

export interface DBRunnerExecuteOptions {
  dbBackupDetail: DBBackupDetail;
  fullStoragePath: string;
  baseFileName: string;
}

export interface DBFileInfo {
  fileName: string;
  filePath: string;
  fileSize: number;
}

export interface ZipFileInfo {
  fileName: string;
  filePath: string;
  fileSize: number;
}

export interface DBZipperExecuteOptions {
  dbFileName: string;
  dbFileStream: ReadStream;
  fullStoragePath: string;
  baseFileName: string;
}
