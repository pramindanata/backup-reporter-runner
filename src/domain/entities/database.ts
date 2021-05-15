import { EmptyEntityPropertyException } from '@/common';
import {
  DatabaseBackupDetail,
  DatabaseBackupDetailProps,
} from './database-backup-detail';
import { Project, ProjectProps } from './project';

export class Database {
  type: DbType;
  name: string;
  host: string;
  port: number;
  user: string;
  password: string;
  project?: Project;
  backupDetail?: DatabaseBackupDetail;

  constructor(props: DatabaseProps) {
    this.type = props.type;
    this.name = props.name;
    this.host = props.host;
    this.port = props.port;
    this.user = props.user;
    this.password = props.password;

    if (props.project) {
      this.project = new Project(props.project);
    }

    if (props.backupDetail) {
      this.backupDetail = new DatabaseBackupDetail(props.backupDetail);
    }
  }

  getShortDbName(): string {
    if (this.type === DbType.MONGODB) {
      return 'mongodb';
    } else if (this.type === DbType.MYSQL) {
      return 'mysql';
    }

    return 'pg';
  }

  getProject(): Project {
    if (!this.project) {
      throw new EmptyEntityPropertyException('project');
    }

    return this.project;
  }

  getBackupDetail(): DatabaseBackupDetail {
    if (!this.backupDetail) {
      throw new EmptyEntityPropertyException('backupDetail');
    }

    return this.backupDetail;
  }
}

export interface DatabaseProps {
  type: DbType;
  name: string;
  host: string;
  port: number;
  user: string;
  password: string;
  project?: ProjectProps;
  backupDetail?: DatabaseBackupDetailProps;
}

export enum DbType {
  POSTGRESQL = 'PostgreSQL',
  MYSQL = 'MySQL',
  MONGODB = 'MongoDB',
}
