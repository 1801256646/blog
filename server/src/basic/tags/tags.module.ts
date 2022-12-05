import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsController } from './tags.controller';
import { Tags } from './entity/tags.entity';
import { TagsService } from './tags.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tags])],
  exports: [TagsService],
  providers: [TagsService],
  controllers: [TagsController],
})
export class TagsModule {}
