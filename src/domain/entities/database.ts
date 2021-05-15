import { DatabaseType, EmptyEntityPropertyException } from '@/common';
import { Project, ProjectProps } from './project';

export class Database {
  type: DatabaseType;
  name: string;
  host: string;
  port: number;
  user: string;
  password: string;
  backupSchedule: string;
  daysUntilFileExpired: number;
  project?: Project;

  constructor(props: DatabaseProps) {
    this.type = props.type;
    this.name = props.name;
    this.host = props.host;
    this.port = props.port;
    this.user = props.user;
    this.password = props.password;
    this.backupSchedule = props.backupSchedule;
    this.daysUntilFileExpired = props.daysUntilFileExpired;

    if (props.project) {
      this.project = new Project(props.project);
    }
  }

  getShortDbName(): string {
    if (this.type === DatabaseType.MongoDb) {
      return 'mongodb';
    } else if (this.type === DatabaseType.MySql) {
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
}

export interface DatabaseProps {
  type: DatabaseType;
  name: string;
  host: string;
  port: number;
  user: string;
  password: string;
  backupSchedule: string;
  daysUntilFileExpired: number;
  project?: ProjectProps;
}
