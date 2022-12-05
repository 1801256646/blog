import { Module } from '@nestjs/common';
import { ReviewModule } from './review/review.module';
import { ReplyModule } from './reply/reply.module';
import { ReleaseModule } from './release/release.module';
import { FocusModule } from './focus/focus.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [ReviewModule, ReplyModule, ReleaseModule, FocusModule, TagsModule],
})
export class BasicModule {}
