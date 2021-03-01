import 'reflect-metadata';
import dotenv from 'dotenv';
import moduleAlias from 'module-alias';

dotenv.config();
moduleAlias.addAlias('@', __dirname);

import { container } from '@/container';
import { Main } from '@/core/main';

try {
  const main = container.resolve(Main);

  main.on('jobError', (err) => {
    handleError(err);
  });

  main.execute();
} catch (err) {
  handleError(err);
}

function handleError(error: Error) {
  console.error(error);
}
