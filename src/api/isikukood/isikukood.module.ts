import { Module } from '@nestjs/common';
import { IsikukoodController } from './isikukood.controller';
import { IsikukoodService } from './isikukood.service';
import { BornSameDayCounter } from './born-same-day-counter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([BornSameDayCounter])],
  controllers: [IsikukoodController],
  providers: [IsikukoodService],
})
export class IsikukoodModule {}
