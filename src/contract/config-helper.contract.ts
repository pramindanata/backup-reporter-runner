import { Project } from '@/domain';

export interface ConfigHelperContract<
  KeyDict extends Record<string, any> = ConfigKey
> {
  get<K extends keyof KeyDict>(key: K): KeyDict[K];
}

interface ConfigKey {
  'app.compressionLevel': number;
  'app.storagePath': string;
  'report.authToken': string;
  'report.reportDeliveryEnabled': boolean;
  'report.serviceUrl': string;
  projects: Project[];
}
