export class DumpEmptyReadStreamException extends Error {
  constructor() {
    super('Empty read stream. No chunks returned from dump proccess.');
  }
}
