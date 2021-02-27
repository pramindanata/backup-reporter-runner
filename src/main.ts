import { createWriteStream, ReadStream, unlink } from 'fs';
import JSZip from 'jszip';
import path from 'path';
import { spawn } from 'child_process';
import { config } from '@/config';

interface DBRunner {
  execute(): Promise<dbFileInfo>;
}

interface dbFileInfo {
  dbFileNameWithoutExtension: string;
  dbFileName: string;
  dbFilePath: string;
}

export class PosgreSQLRunner implements DBRunner {
  execute(): Promise<dbFileInfo> {
    const { db } = config;
    const dbFileNameWithoutExtension = `db_${new Date().getTime()}`;
    const dbFileName = `${dbFileNameWithoutExtension}.sql`;
    const dbFilePath = path.join(__dirname, `../storage/${dbFileName}`);
    const writableDBFileStream = createWriteStream(dbFilePath);
    const dbDumpProccess = spawn(
      'pg_dump',
      ['-h', db.host, '-U', db.user, '-p', db.port.toString(), '-w', db.name],
      {
        env: {
          PGPASSWORD: db.password,
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
            throw new Error('Empty stream');
          }
        })
        .pipe(writableDBFileStream)
        .on('finish', () => {
          resolve({
            dbFileNameWithoutExtension,
            dbFileName,
            dbFilePath,
          });
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }
}

interface zipFileInfo {
  zipFileName: string;
  zipFilePath: string;
}

interface DBZipperExecuteOptions {
  dbFileName: string;
  dbFileNameWithoutExtension: string;
  DBFileStream: ReadStream;
}

export class DBZipper {
  constructor(private zip: JSZip) {}

  execute(options: DBZipperExecuteOptions): Promise<zipFileInfo> {
    const { dbFileName, dbFileNameWithoutExtension, DBFileStream } = options;
    const zipFileName = `${dbFileNameWithoutExtension}.zip`;
    const zipFilePath = path.join(__dirname, `../storage/${zipFileName}`);
    const writableZipFileStream = createWriteStream(zipFilePath);

    return new Promise((resolve, reject) => {
      this.zip.file(dbFileName, DBFileStream);
      this.zip
        .generateNodeStream({ streamFiles: true })
        .pipe(writableZipFileStream)
        .on('finish', () => {
          resolve({
            zipFileName,
            zipFilePath,
          });
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }
}

export class DBFileRemover {
  execute(dbFilePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      unlink(dbFilePath, (err) => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  }
}
