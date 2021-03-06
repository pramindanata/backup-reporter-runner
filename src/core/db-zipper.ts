import { createWriteStream, createReadStream } from 'fs';
import { injectable } from 'tsyringe';
import path from 'path';
import { config } from '@/config';
import { DBZipperExecuteOptions, ZipFileDetail } from '@/interface';
import { getFileSize } from '@/core/util';
import JSZip from 'jszip';

@injectable()
export class DBZipper {
  zip(options: DBZipperExecuteOptions): Promise<ZipFileDetail> {
    const { dbFileDetail, fullStoragePath, baseFileName } = options;
    const zipFileName = `${baseFileName}.zip`;
    const zipFilePath = path.join(fullStoragePath, zipFileName);
    const writableZipFileStream = createWriteStream(zipFilePath);

    return new Promise((resolve, reject) => {
      // Must use fresh instance per zip
      const zip = new JSZip();
      const dbFileName = dbFileDetail.fileName;
      const dbFilePath = dbFileDetail.filePath;
      const dbFileStream = createReadStream(dbFilePath);

      zip.file(dbFileName, dbFileStream);

      const readZipStream = zip
        .generateNodeStream({
          streamFiles: true,
          compression: 'DEFLATE',
          compressionOptions: {
            level: config.app.compressionLevel,
          },
        })
        .on('error', (err) => {
          reject(err);
        });

      const writeZipStream = writableZipFileStream
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

      readZipStream.pipe(writeZipStream);
    });
  }
}
