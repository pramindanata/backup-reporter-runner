export interface BackupFileHelperContract {
  createBaseName(currentDate: Date): string;
  getSize(path: string): Promise<number>;
}
