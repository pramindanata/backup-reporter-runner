import { injectable } from 'tsyringe';
import { createWriteStream } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { DBFileInfo, DBRunner, DBRunnerExecuteOptions } from '@/interface';
import { getFileSize, getShortDBName } from '@/core/util';
import { DBType } from '@/constant';

@injectable()
export class PosgreSQLRunner implements DBRunner {
  execute(options: DBRunnerExecuteOptions): Promise<DBFileInfo> {
    const { baseFileName, dbBackupDetail, fullStoragePath } = options;
    const dbFileName = `${baseFileName}.sql`;
    const dbFilePath = path.join(fullStoragePath, dbFileName);
    const writableDBFileStream = createWriteStream(dbFilePath);
    const dbDumpProccess = spawn(
      'pg_dump',
      [
        '-h',
        dbBackupDetail.host,
        '-U',
        dbBackupDetail.user,
        '-p',
        dbBackupDetail.port.toString(),
        '-w',
        dbBackupDetail.name,
      ],
      {
        env: {
          PGPASSWORD: dbBackupDetail.password,
        },
      },
    );

    return new Promise((resolve, reject) => {
      let haveChunk = false;

      dbDumpProccess.stdout
        .on('data', () => {
          if (haveChunk) {
            return;
          }

          haveChunk = true;
        })
        .on('end', () => {
          if (!haveChunk) {
            throw new DBRunnerEmptyReadStreamException();
          }
        })
        .pipe(writableDBFileStream)
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
    });
  }
}

export class DBRunnerEmptyReadStreamException extends Error {
  constructor() {
    super('Empty read stream. Please check its runner command.');
  }
}