import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from '@/core/core.module';
import { BusinessModule } from '@/business/business.module';
import { BasicModule } from '@/basic/basic.module';
import { ScheduleModule } from '@nestjs/schedule';
import { global } from './config';
import databaseConfig from './config/database';

const { env } = process;
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [global, databaseConfig],
      envFilePath: ['.env'],
    }),
    ScheduleModule.forRoot(),
    CoreModule,
    BusinessModule,
    BasicModule,
    TypeOrmModule.forRoot({
      username: env.DB_NAME || 'root',
      port: Number(env.DB_PORT) || 3306,
      host: '0.0.0.0',
      password: env.DB_PASSWORD,
      type: 'mysql',
      database: env.DB_DATABASE || 'blog',
      synchronize: false,
      autoLoadEntities: true,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
