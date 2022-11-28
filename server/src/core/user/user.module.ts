import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensitiveModule } from '@/core/sensitive/sensitive.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { PasswordModule } from '../password/password.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PasswordModule, SensitiveModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
