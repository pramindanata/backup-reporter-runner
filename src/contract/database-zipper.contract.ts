import { DumpedFileDetail, ZippedFileDetail } from '@/common';

export interface DatabaseZipperContract {
  zip(options: DatabaseZipperZipOptions): Promise<ZippedFileDetail>;
}

export interface DatabaseZipperZipOptions {
  dumpedFileDetail: DumpedFileDetail;
  zipFolderPath: string;
  baseFileName: string;
}
