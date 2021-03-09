import { DBType } from '@/constant';

export interface Config {
  app: {
    compressionLevel: number;
    enableReportDelivery: boolean;
    storagePath: string;
  };
  report: {
    authToken: string;
  };
  bot: {
    url: string;
  };
  projects: ProjectConfig[];
}

export type OnJobError = (error: any) => void;

export interface ProjectConfig {
  name: string;
  databases: DBBackupConfig[];
}

export interface DBBackupConfig {
  type: DBType;
  name: string;
  host: string;
  port: number;
  user: string;
  password: string;
  backupSchedule: string;
  daysUntilExpired: number;
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
  dbBackupConfig: DBBackupConfig;
  folderPath: string;
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
  folderPath: string;
  baseFileName: string;
}

export interface ServerDetail {
  computerName: string;
  ip: string;
}

export interface BasePublisher {
  sendSuccessReport: (report: SuccessReport) => Promise<void>;
  sendFailedReport: (report: FailedReport) => Promise<void>;
}
