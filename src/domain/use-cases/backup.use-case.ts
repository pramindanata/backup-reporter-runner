import { inject, injectable } from 'tsyringe';
import { unlink } from 'fs/promises';
import { DumpedFileDetail, Token, ZippedFileDetail } from '@/common';
import {
  BackupFileHelperContract,
  BackupFolderHelperContract,
  DatabaseDumperContract,
  DatabaseZipperContract,
} from '@/contract';
import { Database } from '../entities';

@injectable()
export class BackupUseCase {
  constructor(
    @inject(Token.DatabaseDumper)
    private dbDumper: DatabaseDumperContract,

    @inject(Token.DatabaseZipper)
    private dbZipper: DatabaseZipperContract,

    @inject(Token.BackupFolderHelper)
    private backupFolderHelper: BackupFolderHelperContract,

    @inject(Token.BackupFileHelper)
    private backupFileHelper: BackupFileHelperContract,
  ) {}

  async execute(database: Database): Promise<BackupResult> {
    const startedAt = new Date();
    const backupFileBaseName = this.backupFileHelper.createBaseName(startedAt);
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
