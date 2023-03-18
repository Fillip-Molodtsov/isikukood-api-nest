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
import { GenerationBody } from './dto/generation-body.dto';
import { PossibleResult } from '../../shared/utils/generics';

@Injectable()
export class IsikukoodService {
  @InjectRepository(BornSameDayCounter)
  private readonly repository: Repository<BornSameDayCounter>;

  public async generateCode(
    input: GenerationBody,
  ): Promise<PossibleResult<string>> {
    const dataBasedPart = this.generateIsikukoodDataBasedPart(input);
    const paddedCountPossible = await this.upsertBornSameDayCounter(
      dataBasedPart,
    );
    if (paddedCountPossible.error) {
      return { ok: null, error: paddedCountPossible.error };
    }
    const paddedCount = paddedCountPossible.ok;
    const controlNumber = this.calculateControlNumber(
      dataBasedPart + paddedCount,
    );
    return { ok: dataBasedPart + paddedCount + controlNumber };
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

  private async upsertBornSameDayCounter(
    dataBasedPart: string,
  ): Promise<PossibleResult<string>> {
    const counter = await this.repository.findOne({
      where: { id: +dataBasedPart },
    });
    const count = counter ? counter.count + 1 : 1;
    if (count === 1000) {
      return { ok: null, error: 'Reached the limit of the day.' };
    }
    await this.repository.save({ id: +dataBasedPart, count });
    return { ok: count.toString().padStart(3, '0') };
  }

  private generateIsikukoodDataBasedPart(input: GenerationBody): string {
    const { gender, birthDate } = input;
    const [day, month, year] = birthDate.split('.');
    const yearFirst2Digits = year.substring(0, 2);
    const yearLast2Digits = year.substring(2, 4);
    let codeFirstDigit: string;
    switch (yearFirst2Digits) {
      case '18':
        codeFirstDigit = gender === 'M' ? '1' : '2';
        break;
      case '19':
        codeFirstDigit = gender === 'M' ? '3' : '4';
        break;
      case '20':
        codeFirstDigit = gender === 'M' ? '5' : '6';
        break;
      case '21':
        codeFirstDigit = gender === 'M' ? '7' : '8';
        break;
    }
    return codeFirstDigit + yearLast2Digits + month + day;
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
    const control = code.charAt(10);
    const mod = this.calculateControlNumber(code);
    return +control === mod;
  }

  private calculateControlNumber(code: string): number {
    const multiplier_1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1];
    const multiplier_2 = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3];

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
    return mod;
  }
}
