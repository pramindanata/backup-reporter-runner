import { singleton } from 'tsyringe';
import { stat } from 'fs';
import { format } from 'date-fns';
import { BackupFileHelperContract } from '@/contract';

@singleton()
export class BackupFileHelper implements BackupFileHelperContract {
  createBaseName(currentDate: Date): string {
    const baseFileName = `${format(currentDate, 'yyyy-MM-dd_HH-mm-ss')}`;

    return baseFileName;
  }

  getSize(path: string): Promise<number> {
    return new Promise((resolve, reject) => {
      stat(path, (err, stats) => {
        if (err) {
          reject(err);
        }

        resolve(stats.size);
      });
    });
  }
}
