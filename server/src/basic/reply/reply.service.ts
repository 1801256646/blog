import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '@/core/user/user.service';
import { SensitiveService } from '@/core/sensitive/sensitive.service';
import { ReviewService } from '../review/review.service';
import { Reply } from './entity/reply.entity';
import { ReplyComment } from './reply.interface';

@Injectable()
export class ReplyService {
  constructor(
    @InjectRepository(Reply)
    private replyRepository: Repository<Reply>,
    private userService: UserService,
    private reviewService: ReviewService,
    private sensitiveService: SensitiveService,
  ) {}

  async findOne(id: number) {
    return this.replyRepository.findOne({
      where: {
        id,
      },
    });
  }

  /**
   * 回复评论
   */
  async reply(dto: ReplyComment, username: string) {
    const { id, replier, text } = dto;
    const userEntity = await this.userService.findNameOne(username);
    await this.sensitiveService.sensitiveCheck(text);
    const reviewEntity = await this.reviewService.findOne(id);
    await this.replyRepository.insert({
      replier,
      text,
      createTime: new Date(),
      childReview: reviewEntity,
      username,
      user: userEntity,
    });
  }
}
