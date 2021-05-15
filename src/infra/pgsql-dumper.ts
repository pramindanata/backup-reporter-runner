import { inject, injectable } from 'tsyringe';
import path from 'path';
import { createWriteStream } from 'fs';
import { spawn } from 'child_process';
import { DumpedFileDetail, Token } from '@/common';
import {
  BackupFileHelperContract,
  DatabaseDumperContract,
  DatabaseDumperDumpOptions,
} from '@/contract';
import { DumpEmptyReadStreamException } from './exceptions';

@injectable()
export class PgSqlDumper implements DatabaseDumperContract {
  constructor(
    @inject(Token.BackupFileHelper)
    private backupFileHelper: BackupFileHelperContract,
  ) {}

  dump(options: DatabaseDumperDumpOptions): Promise<DumpedFileDetail> {
    const { baseFileName, database, dumpFolderPath } = options;
    const dbFileName = `${baseFileName}.sql`;
    const dbFilePath = path.join(dumpFolderPath, dbFileName);
    const writableDBFileStream = createWriteStream(dbFilePath);
    const dumpProcess = spawn(
      'pg_dump',
      [
        '-h',
        database.host,
        '-U',
        database.user,
        '-p',
        database.port.toString(),
        '-w',
        database.name,
      ],
      {
        env: {
          PGPASSWORD: database.password,
        },
      },
    );

    return new Promise((resolve, reject) => {
      let haveChunk = false;

      const readDumpStream = dumpProcess.stdout
        .on('data', () => {
          if (haveChunk) {
            return;
          }

          haveChunk = true;
        })
        .on('end', () => {
          if (!haveChunk) {
            reject(new DumpEmptyReadStreamException());
          }
        })
        .on('error', (err) => {
          reject(err);
        });

      const writeDBStream = writableDBFileStream
        .on('finish', async () => {
          resolve({
            name: dbFileName,
            path: dbFilePath,
            size: await this.backupFileHelper.getSize(dbFilePath),
          });
        })
        .on('error', (err) => {
          reject(err);
        });

      readDumpStream.pipe(writeDBStream);
    });
  }
}
