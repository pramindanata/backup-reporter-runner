import { EmptyEntityPropertyException } from '@/common';
import { Database, DatabaseProps } from './database';

export class Project {
  name: string;
  databases?: Database[];

  constructor(props: ProjectProps) {
    this.name = props.name;

    if (props.databases) {
      this.databases = props.databases.map((dbProps) => new Database(dbProps));
    }
  }

  getDatabases(): Database[] {
    if (!this.databases) {
      throw new EmptyEntityPropertyException('databases');
    }

    return this.databases;
  }
}

export interface ProjectProps {
  name: string;
  databases?: DatabaseProps[];
}
