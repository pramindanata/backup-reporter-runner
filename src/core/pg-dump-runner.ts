import { injectable } from 'tsyringe';
import { createWriteStream } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import {
  DBFileDetail,
  DBDumpRunner,
  DBDumpRunnerExecuteOptions,
} from '@/interface';
import { getFileSize } from '@/core/util';

@injectable()
export class PGDumpRunner implements DBDumpRunner {
  dump(options: DBDumpRunnerExecuteOptions): Promise<DBFileDetail> {
    const { baseFileName, dbBackupConfig, folderPath } = options;
    const dbFileName = `${baseFileName}.sql`;
    const dbFilePath = path.join(folderPath, dbFileName);
    const writableDBFileStream = createWriteStream(dbFilePath);
    const dbDumpProccess = spawn(
      'pg_dump',
      [
        '-h',
        dbBackupConfig.host,
        '-U',
        dbBackupConfig.user,
        '-p',
        dbBackupConfig.port.toString(),
        '-w',
        dbBackupConfig.name,
      ],
      {
        env: {
          PGPASSWORD: dbBackupConfig.password,
        },
      },
    );

    return new Promise((resolve, reject) => {
      let haveChunk = false;

      const readDumpStream = dbDumpProccess.stdout
        .on('data', () => {
          if (haveChunk) {
            return;
          }

          haveChunk = true;
        })
        .on('end', () => {
          if (!haveChunk) {
            reject(new DBRunnerEmptyReadStreamException());
          }
        })
        .on('error', (err) => {
          reject(err);
        });

      const writeDBStream = writableDBFileStream
        .on('finish', async () => {
          resolve({
            fileName: dbFileName,
            filePath: dbFilePath,
            fileSize: await getFileSize(dbFilePath),
          });
        })
        .on('error', (err) => {
          reject(err);
        });

      readDumpStream.pipe(writeDBStream);
    });
  }
}

export class DBRunnerEmptyReadStreamException extends Error {
  constructor() {
    super('Empty read stream. No chunks returned from backup proccess.');
  }
}
