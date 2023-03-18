import { Controller, Get, Inject, Param } from '@nestjs/common';
import { IsikukoodService } from './isikukood.service';
import { ValidationResult } from './dto/validation-results.dto';

@Controller('isikukood')
export class IsikukoodController {
  @Inject(IsikukoodService)
  private readonly service: IsikukoodService;

  @Get('/check/:code')
  public checkIsikuKood(@Param('code') code: string): ValidationResult {
    return this.service.validateCode(code);
  }
}
