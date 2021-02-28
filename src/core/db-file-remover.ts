import { unlink } from 'fs';
import { injectable } from 'tsyringe';

@injectable()
export class DBFileRemover {
  execute(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      unlink(filePath, (err) => {
        if (err) {
          reject(err);
        }

        resolve();
      });
    });
  }
}
