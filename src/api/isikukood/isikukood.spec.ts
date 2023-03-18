import { Test, TestingModule } from '@nestjs/testing';
import { IsikukoodController } from './isikukood.controller';
import { IsikukoodService } from './isikukood.service';
import { BornSameDayCounter } from './born-same-day-counter.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GenerationBody } from './dto/generation-body.dto';
import {
  IsGenderErrorMessage,
  RightDateFormatErrorMessage,
} from './validator/custom-validators';
import { Repository } from 'typeorm';

describe('IsikukoodController', () => {
  let controller: IsikukoodController;
  let service: IsikukoodService;
  let repository: Repository<BornSameDayCounter>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IsikukoodController],
      providers: [
        IsikukoodService,
        {
          provide: getRepositoryToken(BornSameDayCounter),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
            save: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<IsikukoodController>(IsikukoodController);
    service = module.get<IsikukoodService>(IsikukoodService);
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('personal code validation', () => {
    it('should return false (incorrect verification number)', () => {
      expect(controller.checkIsikuKood('48401234266')).toStrictEqual({
        isValid: false,
      });
    });

    it('should return false (not a number)', () => {
      expect(controller.checkIsikuKood('48401I34266')).toStrictEqual({
        isValid: false,
      });
    });

    it('should return false (not 11-digit long)', () => {
      expect(controller.checkIsikuKood('4840134266')).toStrictEqual({
        isValid: false,
      });
    });

    it('should return false (a 11-digit long number with spaces inside)', () => {
      expect(controller.checkIsikuKood('48 4  01 3  4 2 6 6')).toStrictEqual({
        isValid: false,
      });
    });

    it('should extract the data', () => {
      const code = '46103020299';
      const expectedData = {
        isValid: true,
        data: {
          gender: 'F',
          birthDate: '02.03.1961',
          serialNumber: '029',
        },
      };
      expect(controller.checkIsikuKood(code)).toStrictEqual(expectedData);
    });
  });

  describe('personal code generation', () => {
    it('should return generated code', async () => {
      const body: GenerationBody = {
        gender: 'M',
        birthDate: '11.02.2002',
      };
      expect(
        await controller.generateIsikuKood(body),
      ).toHaveProperty('code', '50202110012');
    });

    it('generated code should be valid', async () => {
      const body = {
        gender: 'M',
        birthDate: '11.02.2002',
      };
      const expectedData = {
        isValid: true,
        data: {
          gender: 'M',
          birthDate: '11.02.2002',
          serialNumber: '001',
        },
      };
      const code = await controller.generateIsikuKood(body as GenerationBody);
      expect(controller.checkIsikuKood(code.code)).toStrictEqual(expectedData);
    });
  });
});
