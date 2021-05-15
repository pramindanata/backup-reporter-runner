import { inject, injectable } from 'tsyringe';
import JSZip from 'jszip';
import path from 'path';
import { createWriteStream, createReadStream } from 'fs';
import { DatabaseZipperContract, DatabaseZipperZipOptions } from '@/contract';
import { ZippedFileDetail } from '@/common';
import { BackupFileHelper, ConfigHelper } from './helpers';

@injectable()
export class DatabaseZipper implements DatabaseZipperContract {
  constructor(
    private backupFileHelper: BackupFileHelper,
    private configHelper: ConfigHelper,
  ) {}

  zip(options: DatabaseZipperZipOptions): Promise<ZippedFileDetail> {
    const { baseFileName, dumpedFileDetail, zipFolderPath } = options;
    const zipFileName = `${baseFileName}.zip`;
    const zipFilePath = path.join(zipFolderPath, zipFileName);
    const writableZipFileStream = createWriteStream(zipFilePath);

    return new Promise((resolve, reject) => {
      // Must use fresh instance per zip
      const zip = new JSZip();
      const dbFileName = dumpedFileDetail.name;
      const dbFilePath = dumpedFileDetail.path;
      const dbFileStream = createReadStream(dbFilePath);

      zip.file(dbFileName, dbFileStream);

      const readZipStream = zip
        .generateNodeStream({
          streamFiles: true,
          compression: 'DEFLATE',
          compressionOptions: {
            level: this.configHelper.get('app.compressionLevel'),
          },
        })
        .on('error', (err) => {
          reject(err);
        });

      const writeZipStream = writableZipFileStream
        .on('finish', async () => {
          resolve({
            name: zipFileName,
            path: zipFilePath,
            size: await this.backupFileHelper.getSize(zipFilePath),
          });
        })
        .on('error', (err) => {
          reject(err);
        });

      readZipStream.pipe(writeZipStream);
    });
  }
}
