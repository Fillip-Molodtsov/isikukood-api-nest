import { Injectable } from '@nestjs/common';
import { BornSameDayCounter } from './born-same-day-counter.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  GenderType,
  IsikuKoodData,
  ValidationResult,
} from './dto/validation-results.dto';
import { isNumberString } from 'class-validator';
import * as moment from 'moment';

@Injectable()
export class IsikukoodService {
  @InjectRepository(BornSameDayCounter)
  private readonly repository: Repository<BornSameDayCounter>;

  public getBornSameDayCount(
    id: number,
  ): Promise<BornSameDayCounter | undefined> {
    // @ts-ignore
    return this.repository.findOne({ id });
  }

  public validateCode(codeUntrimmed: string): ValidationResult {
    const code = codeUntrimmed.trim();
    const isValid = this.checkCode(code);
    if (!isValid) return { isValid };
    return {
      isValid,
      data: this.extractDataFromCode(code),
    };
  }

  private extractDataFromCode(code: string): IsikuKoodData {
    return {
      gender: this.extractGender(code),
      birthDate: this.extractBirthday(code),
      serialNumber: this.extractSerialNumber(code),
    };
  }

  private extractSerialNumber(code: string): string {
    return code.substring(7, 10);
  }

  private extractBirthday(code: string): string {
    let year = parseInt(code.substring(1, 3));
    const month = parseInt(code.substring(3, 5).replace(/^0/, '')) - 1;
    const day = code.substring(5, 7).replace(/^0/, '');
    const firstNumber = code.charAt(0);

    if (firstNumber === '1' || firstNumber === '2') {
      year += 1800;
    } else if (firstNumber === '3' || firstNumber === '4') {
      year += 1900;
    } else if (firstNumber === '5' || firstNumber === '6') {
      year += 2000;
    } else if (firstNumber === '7' || firstNumber === '8') {
      year += 2100;
    }

    return moment(new Date(year, month, +day)).format('DD.MM.YYYY');
  }
  /*
   * assumed that the code is already validated
   * */
  private extractGender(code: string): GenderType {
    const firstNumber = code.charAt(0);
    let res: GenderType;
    switch (firstNumber) {
      case '1':
      case '3':
      case '5':
      case '7':
        res = 'M';
        break;
      case '2':
      case '4':
      case '6':
      case '8':
        res = 'F';
        break;
    }
    return res;
  }
  /*
  it should be a number
  the code should be 11-digit long
  check the control number
   */
  private checkCode(code: string): boolean {
    const isNumber = isNumberString(code);
    if (!isNumber) return false;
    const is11digit = code.length === 11;
    if (!is11digit) return false;
    const controlNumberValid = this.checkControlNumber(code);
    return controlNumberValid;
  }

  private checkControlNumber(code: string): boolean {
    const multiplier_1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1];
    const multiplier_2 = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3];

    const control = code.charAt(10);

    let mod: number;
    let total = 0;

    /* Do first run. */
    for (let i = 0; i < 10; i++) {
      total += +code.charAt(i) * multiplier_1[i];
    }
    mod = total % 11;

    /* If modulus is ten we need second run. */
    total = 0;
    if (10 == mod) {
      for (let i = 0; i < 10; i++) {
        total += +code.charAt(i) * multiplier_2[i];
      }
      mod = total % 11;

      /* If modulus is still ten revert to 0. */
      if (10 == mod) {
        mod = 0;
      }
    }

    return +control == mod;
  }
}
