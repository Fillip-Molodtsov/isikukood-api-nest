import { Module } from '@nestjs/common';
import { IsikukoodModule } from './isikukood/isikukood.module';

@Module({
  imports: [IsikukoodModule],
})
export class ApiModule {}
