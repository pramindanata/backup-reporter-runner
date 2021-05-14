import { unlink } from 'fs/promises';
import { DumpedFileDetail, ZippedFileDetail } from '@/common';
import {
  BackupFileHelperContract,
  BackupFolderHelperContract,
  DatabaseDumperContract,
  DatabaseZipperContract,
} from '@/contract';
import { Database } from '../entities';

export class BackupUseCase {
  constructor(
    private dbDumper: DatabaseDumperContract,
    private dbZipper: DatabaseZipperContract,
    private backupFolderHelper: BackupFolderHelperContract,
    private backupFileHelper: BackupFileHelperContract,
  ) {}

  async execute(database: Database): Promise<BackupResult> {
    const startedAt = new Date();
    const backupFileBaseName = this.backupFileHelper.createBaseName();
    const backupFolderPath = this.backupFolderHelper.createPath(database);

    const dumpedFileDetail = await this.dbDumper.dump({
      database,
      dumpFolderPath: backupFolderPath,
      baseFileName: backupFileBaseName,
    });

    const zippedFileDetail = await this.dbZipper.zip({
      dumpedFileDetail,
      zipFolderPath: backupFolderPath,
      baseFileName: backupFileBaseName,
    });

    await unlink(dumpedFileDetail.path);

    const finishedAt = new Date();

    return {
      dumpedFileDetail,
      zippedFileDetail,
      startedAt,
      finishedAt,
    };
  }
}

interface BackupResult {
  dumpedFileDetail: DumpedFileDetail;
  zippedFileDetail: ZippedFileDetail;
  startedAt: Date;
  finishedAt: Date;
}
