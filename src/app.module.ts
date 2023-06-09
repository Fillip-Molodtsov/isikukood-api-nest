import { Module } from '@nestjs/common';
import { getEnvPath } from './common/helper/env.helper';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfigService } from './shared/typeorm/typeorm.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiModule } from './api/api.module';

const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    ApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
