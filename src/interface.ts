import { DBType } from '@/constant';

export interface Config {
  app: {
    compressionLevel: number;
    enableReportDelivery: boolean;
    storagePath: string;
  };
  bot: {
    url: string;
  };
  projects: ProjectDetail[];
}

export type OnJobError = (error: any) => void;

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
  computerName: string;
  projectName: string;
  ip: string;
  startedAt: Date;
  finishedAt: Date;
  detail: {
    name: string;
    type: DBType;
    filePath: string;
    fileSize: number;
  };
}

export interface FailedReport {
  computerName: string;
  projectName: string;
  ip: string;
  startedAt: Date;
  detail: {
    name: string;
    type: DBType;
    message: string;
  };
}

export interface DBDumpRunner {
  dump(options: DBDumpRunnerExecuteOptions): Promise<DBFileDetail>;
}

export interface DBDumpRunnerExecuteOptions {
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
  dbFileDetail: DBFileDetail;
  fullStoragePath: string;
  baseFileName: string;
}

export interface ServerDetail {
  computerName: string;
  ip: string;
}
