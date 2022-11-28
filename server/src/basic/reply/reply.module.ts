import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@/core/user/user.module';
import { SensitiveModule } from '@/core/sensitive/sensitive.module';
import { ReplyController } from './reply.controller';
import { ReplyService } from './reply.service';
import { ReviewModule } from '../review/review.module';
import { Reply } from './entity/reply.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reply]),
    UserModule,
    ReviewModule,
    SensitiveModule,
  ],
  providers: [ReplyService],
  controllers: [ReplyController],
  exports: [ReplyService],
})
export class ReplyModule {}
