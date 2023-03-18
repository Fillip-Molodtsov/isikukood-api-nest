import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import * as moment from 'moment';

export const RightDateFormatErrorMessage =
  "The date should be in the format of 'DD.MM.YYYY'";

export const IsGenderErrorMessage = "Permissable values for gender: 'M', 'F'";

@ValidatorConstraint({ name: 'RightDateFormat', async: false })
export class RightDateFormat implements ValidatorConstraintInterface {
  validate(date: string, args: ValidationArguments) {
    return moment(date, 'DD.MM.YYYY', true).isValid();
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return RightDateFormatErrorMessage;
  }
}

@ValidatorConstraint({ name: 'IsGender', async: false })
export class IsGender implements ValidatorConstraintInterface {
  validate(gender: string, args: ValidationArguments) {
    const toUpper = gender.toUpperCase();
    return ['M', 'F'].includes(toUpper);
  }
  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return IsGenderErrorMessage;
  }
}
