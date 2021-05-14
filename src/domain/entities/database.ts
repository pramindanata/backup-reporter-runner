import {
  DatabaseBackupDetail,
  DatabaseBackupDetailProps,
} from './database-backup-detail';

export class Database {
  type: DbType;
  name: string;
  host: string;
  port: number;
  user: string;
  password: string;
  backupDetail?: DatabaseBackupDetail;

  constructor(props: DatabaseProps) {
    this.type = props.type;
    this.name = props.name;
    this.host = props.host;
    this.port = props.port;
    this.user = props.user;
    this.password = props.password;

    if (props.backupDetail) {
      this.backupDetail = props.backupDetail;
    }
  }

  getShortDbName(type: DbType): string {
    if (type === DbType.MONGODB) {
      return 'mongodb';
    } else if (type === DbType.MYSQL) {
      return 'mysql';
    }

    return 'pg';
  }
}

export interface DatabaseProps {
  type: DbType;
  name: string;
  host: string;
  port: number;
  user: string;
  password: string;
  backupDetail?: DatabaseBackupDetailProps;
}

export enum DbType {
  POSTGRESQL = 'PostgreSQL',
  MYSQL = 'MySQL',
  MONGODB = 'MongoDB',
}
