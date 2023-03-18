import { Test, TestingModule } from '@nestjs/testing';
import { IsikukoodController } from './isikukood.controller';
import { IsikukoodService } from './isikukood.service';
import { BornSameDayCounter } from './born-same-day-counter.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('IsikukoodController', () => {
  let controller: IsikukoodController;
  let service: IsikukoodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IsikukoodController],
      providers: [
        IsikukoodService,
        {
          provide: getRepositoryToken(BornSameDayCounter),
          useValue: {},
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
});
