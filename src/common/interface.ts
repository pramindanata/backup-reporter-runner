import { DatabaseType } from './constant';

export interface DumpedFileDetail {
  name: string;
  path: string;
  size: number;
}

export interface ZippedFileDetail {
  name: string;
  path: string;
  size: number;
}

export interface Config {
  app: {
    compressionLevel: number;
    storagePath: string;
  };
  report: {
    authToken: string;
    deliveryEnabled: boolean;
    serviceUrl: string;
  };
  projects: {
    name: string;
    databases: {
      type: DatabaseType;
      name: string;
      host: string;
      port: number;
      user: string;
      password: string;
      backupSchedule: string;
      daysUntilFileExpired: number;
    }[];
  }[];
}
