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

export interface BackupResultDetail {
  dbFileDetail: DBFileDetail;
  zipFileDetail: ZipFileDetail;
}

export interface SuccessReport {
  projectName: string;
  startedAt: Date;
  finishedAt: Date;
  dbFileDetail: DBFileDetail;
  zipFileDetail: ZipFileDetail;
}

export interface FailedReport {
  projectName: string;
  startedAt: Date;
  dbBackupDetail: DBBackupDetail;
  error: Error;
}

export interface DBRunner {
  execute(options: DBRunnerExecuteOptions): Promise<DBFileDetail>;
}

export interface DBRunnerExecuteOptions {
  dbBackupDetail: DBBackupDetail;
  fullStoragePath: string;
  baseFileName: string;
}

export interface DBFileDetail {
  fileName: string;
  filePath: string;
  fileSize: number;
}

export interface ZipFileDetail {
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

export interface ServerDetail {
  computerName: string;
  ip: string;
}
