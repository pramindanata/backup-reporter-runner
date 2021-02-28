import { createWriteStream } from 'fs';
import { injectable } from 'tsyringe';
import JSZip from 'jszip';
import path from 'path';
import { config } from '@/config';
import { DBZipperExecuteOptions, ZipFileInfo } from '@/interface';
import { getFileSize } from '@/core/util';

@injectable()
export class DBZipper {
  constructor(private zip: JSZip) {}

  execute(options: DBZipperExecuteOptions): Promise<ZipFileInfo> {
    const { dbFileName, dbFileStream, fullStoragePath, baseFileName } = options;
    const zipFileName = `${baseFileName}.zip`;
    const zipFilePath = path.join(fullStoragePath, zipFileName);
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
