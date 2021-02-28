import { stat } from 'fs';
import path from 'path';
import { format } from 'date-fns';
import { config } from '@/config';
import { DBType } from '@/constant';

export function getFileSize(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      }

      resolve(stats.size);
    });
  });
}

export function generateBaseFileName(): string {
  const currentDateTime = new Date();
  const baseFileName = `${format(currentDateTime, 'yyyy-MM-dd_HH-mm-ss')}`;

  return baseFileName;
}

export function generateFullStoragePath(
  projectName: string,
  dbName: string,
  dbType: DBType,
): string {
  const fullStoragePath = path.join(
    config.app.storagePath,
    projectName,
    `${getShortDBName(dbType)}_${dbName}`,
  );

  return fullStoragePath;
}

export function getShortDBName(dbType: DBType): string {
  if (dbType === DBType.MONGODB) {
    return 'mongodb';
  } else if (dbType === DBType.MYSQL) {
    return 'mysql';
  }

  return 'pg';
}
