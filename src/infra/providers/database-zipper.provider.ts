import { DependencyContainer } from 'tsyringe';
import { Token } from '@/common';
import { DatabaseZipper } from '../database-zipper';

export function registerDatabaseZipperProvider(
  container: DependencyContainer,
): void {
  container.register(Token.DatabaseZipper, {
    useFactory: (c) => {
      return c.resolve(DatabaseZipper);
    },
  });
}
