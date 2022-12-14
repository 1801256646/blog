import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { SensitiveService } from './sensitive.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'http://hn216.api.yesapi.cn',
      timeout: 60000,
    }),
    ConfigModule,
  ],
  providers: [SensitiveService],
  exports: [SensitiveService],
})
export class SensitiveModule {}
