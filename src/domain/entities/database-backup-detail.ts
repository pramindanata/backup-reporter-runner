export class DatabaseBackupDetail {
  schedule: string;
  daysUntilFileExpired: number;

  constructor(props: DatabaseBackupDetailProps) {
    this.schedule = props.schedule;
    this.daysUntilFileExpired = props.daysUntilFileExpired;
  }
}

export interface DatabaseBackupDetailProps {
  schedule: string;
  daysUntilFileExpired: number;
}
