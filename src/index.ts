import 'reflect-metadata';
import dotenv from 'dotenv';
import moduleAlias from 'module-alias';

dotenv.config();
moduleAlias.addAlias('@', __dirname);

import JSZip from 'jszip';
import { createReadStream } from 'fs';
import { DBFileRemover, DBZipper, PosgreSQLRunner } from '@/main';

try {
  execute();
} catch (err) {
  throw err;
}

async function execute() {
  const zip = new JSZip();
  const pgRunner = new PosgreSQLRunner();
  const dbZipper = new DBZipper(zip);
  const dbFileRemover = new DBFileRemover();

  console.log(`[x] Begin backup`);

  const dbFileInfo = await pgRunner.execute();
  const { dbFileName, dbFileNameWithoutExtension, dbFilePath } = dbFileInfo;

  console.log(`[x] Archiving ${dbFileName}`);

  const { zipFilePath } = await dbZipper.execute({
    dbFileName,
    dbFileNameWithoutExtension,
    DBFileStream: createReadStream(dbFilePath),
  });

  console.log(`[x] Removing ${dbFileName}`);

  await dbFileRemover.execute(dbFilePath);

  console.log(`[x] Complete, see: ${zipFilePath}`);
}
