import { DependencyContainer } from 'tsyringe';
import { Token } from '@/common';
import { PgSqlDumper } from '../pgsql-dumper';

export function registerDatabaseDumperProvider(
  container: DependencyContainer,
): void {
  container.register(Token.DatabaseDumper, {
    useFactory: (c) => {
      return c.resolve(PgSqlDumper);
    },
  });
}
