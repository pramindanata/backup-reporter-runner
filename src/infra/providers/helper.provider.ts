import { DependencyContainer } from 'tsyringe';
import { Token } from '@/common';
import { BackupFileHelper, BackupFolderHelper, ConfigHelper } from '../helpers';

export function registerHelperProvider(container: DependencyContainer): void {
  container.register(Token.ConfigHelper, {
    useFactory: (c) => {
      return c.resolve(ConfigHelper);
    },
  });

  container.register(Token.BackupFileHelper, {
    useFactory: (c) => {
      return c.resolve(BackupFileHelper);
    },
  });

  container.register(Token.BackupFolderHelper, {
    useFactory: (c) => {
      return c.resolve(BackupFolderHelper);
    },
  });
}
