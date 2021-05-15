export class EmptyEntityPropertyException extends Error {
  constructor(property: string) {
    super(`Empty entity property "${property}"`);
  }
}
