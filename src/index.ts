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

  console.log(`[x] Archiving ${dbFileInfo.fileName}`);

  const zipFileInfo = await dbZipper.execute({
    dbFileName: dbFileInfo.fileName,
    dbFileNameWithoutExtension: dbFileInfo.fileNameWithoutExtension,
    dbFileStream: createReadStream(dbFileInfo.filePath),
  });

  console.log(`[x] Removing ${dbFileInfo.fileName}`);

  await dbFileRemover.execute(dbFileInfo.filePath);

  console.log(`[x] Complete, see: ${zipFileInfo.filePath}`);
}
