import { GenderType } from './validation-results.dto';
import { IsGender, RightDateFormat } from '../validator/custom-validators';
import { Validate } from 'class-validator';

export class GenerationBody {
  @Validate(IsGender)
  public gender: GenderType;
  @Validate(RightDateFormat)
  public birthDate: string;
}

export class GenerationOutput {
  public code: string;
  public error?: string;
}
