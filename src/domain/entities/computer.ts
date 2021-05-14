export class Computer {
  name: string;
  publicIp: string;

  constructor(props: ComputerProps) {
    this.name = props.name;
    this.publicIp = props.publicIp;
  }
}

export interface ComputerProps {
  name: string;
  publicIp: string;
}
