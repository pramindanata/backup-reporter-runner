import { createWriteStream, ReadStream, unlink, stat } from 'fs';
import JSZip from 'jszip';
import path from 'path';
import { spawn } from 'child_process';
import { config } from '@/config';

interface DBRunner {
  execute(): Promise<dbFileInfo>;
}

interface dbFileInfo {
  fileNameWithoutExtension: string;
  fileName: string;
  filePath: string;
  fileSize: number;
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
        .on('finish', async () => {
          resolve({
            fileNameWithoutExtension: dbFileNameWithoutExtension,
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

interface zipFileInfo {
  fileName: string;
  filePath: string;
  fileSize: number;
}

interface DBZipperExecuteOptions {
  dbFileName: string;
  dbFileNameWithoutExtension: string;
  dbFileStream: ReadStream;
}

export class DBZipper {
  constructor(private zip: JSZip) {}

  execute(options: DBZipperExecuteOptions): Promise<zipFileInfo> {
    const { dbFileName, dbFileNameWithoutExtension, dbFileStream } = options;
    const zipFileName = `${dbFileNameWithoutExtension}.zip`;
    const zipFilePath = path.join(__dirname, `../storage/${zipFileName}`);
    const writableZipFileStream = createWriteStream(zipFilePath);

    return new Promise((resolve, reject) => {
      this.zip.file(dbFileName, dbFileStream);
      this.zip
        .generateNodeStream({
          streamFiles: true,
          compression: 'DEFLATE',
          compressionOptions: {
            level: config.app.compressionLevel,
          },
        })
        .pipe(writableZipFileStream)
        .on('finish', async () => {
          resolve({
            fileName: zipFileName,
            filePath: zipFilePath,
            fileSize: await getFileSize(zipFilePath),
          });
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }
}

export class DBFileRemover {
  execute(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      unlink(filePath, (err) => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  }
}

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
