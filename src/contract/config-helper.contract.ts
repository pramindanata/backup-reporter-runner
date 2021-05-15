import { Config } from '@/common';

export interface ConfigHelperContract<
  KeyDict extends Record<string, any> = ConfigKey
> {
  get<K extends keyof KeyDict>(key: K): KeyDict[K];
}

export interface ConfigKey {
  'app.compressionLevel': number;
  'app.storagePath': string;
  'report.authToken': string;
  'report.reportDeliveryEnabled': boolean;
  'report.serviceUrl': string;
  projects: Config['projects'];
  'fail.ss': string;
}
