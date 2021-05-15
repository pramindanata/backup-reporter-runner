import { BackupUseCase, Database } from '@/domain';
import { injectable } from 'tsyringe';

@injectable()
export class BackupTask {
  constructor(private backupUseCase: BackupUseCase) {}

  async execute(database: Database): Promise<void> {
    const result = await this.backupUseCase.execute(database);

    console.log('Backup Done', result);
  }
}
