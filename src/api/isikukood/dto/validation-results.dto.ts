export class ValidationResult {
  public isValid: boolean;
  public data?: IsikuKoodData;
}

export type GenderType = 'M' | 'F';
export class IsikuKoodData {
  gender: GenderType;
  birthDate: string;
  serialNumber: string;
}
