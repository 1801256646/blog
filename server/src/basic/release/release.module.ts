import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@/core/user/user.module';
import { ApproverModule } from '@/core/approver/approver.module';
import { SensitiveModule } from '@/core/sensitive/sensitive.module';
import { ReleaseController } from './release.controller';
import { ReleaseService } from './release.service';
import { Release } from './entity/release.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Release]),
    UserModule,
    ApproverModule,
    SensitiveModule,
  ],
  controllers: [ReleaseController],
  exports: [ReleaseService],
  providers: [ReleaseService],
})
export class ReleaseModule {}
