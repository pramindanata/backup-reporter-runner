import { container } from 'tsyringe';
import { registerConfigProvider } from './config.provider';
import { registerDatabaseDumperProvider } from './database-dumper.provider';
import { registerDatabaseZipperProvider } from './database-zipper.provider';
import { registerHelperProvider } from './helper.provider';

registerConfigProvider(container);
registerHelperProvider(container);
registerDatabaseDumperProvider(container);
registerDatabaseZipperProvider(container);

export { container };
