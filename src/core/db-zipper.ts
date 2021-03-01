import { createWriteStream } from 'fs';
import { injectable } from 'tsyringe';
import path from 'path';
import { config } from '@/config';
import { DBZipperExecuteOptions, ZipFileDetail } from '@/interface';
import { getFileSize } from '@/core/util';
import JSZip from 'jszip';

@injectable()
export class DBZipper {
  execute(options: DBZipperExecuteOptions): Promise<ZipFileDetail> {
    const { dbFileName, dbFileStream, fullStoragePath, baseFileName } = options;
    const zipFileName = `${baseFileName}.zip`;
    const zipFilePath = path.join(fullStoragePath, zipFileName);
    const writableZipFileStream = createWriteStream(zipFilePath);

    return new Promise((resolve, reject) => {
      // Must use fresh instance per zip
      const zip = new JSZip();

      zip.file(dbFileName, dbFileStream);
      zip
        .generateNodeStream({
          streamFiles: true,
          compression: 'DEFLATE',
          compressionOptions: {
            level: config.app.compressionLevel,
          },
        })
        .on('error', (err) => {
          reject(err);
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
