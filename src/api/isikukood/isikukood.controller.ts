import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { IsikukoodService } from './isikukood.service';
import { ValidationResult } from './dto/validation-results.dto';
import { GenerationBody, GenerationOutput } from './dto/generation-body.dto';

@Controller('isikukood')
export class IsikukoodController {
  @Inject(IsikukoodService)
  private readonly service: IsikukoodService;

  @Get('/check/:code')
  public checkIsikuKood(@Param('code') code: string): ValidationResult {
    return this.service.validateCode(code);
  }

  @Post('/generate')
  public async generateIsikuKood(
    @Body() body: GenerationBody,
  ): Promise<GenerationOutput> {
    const codePossible = await this.service.generateCode(body);
    return { code: codePossible.ok, error: codePossible.error };
  }
}
