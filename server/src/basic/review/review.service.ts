import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '@/core/user/user.service';
import { ReleaseService } from '@/basic/release/release.service';
import { SensitiveService } from '@/core/sensitive/sensitive.service';
import { Review } from './entity/review.entity';
import { ReviewInterface, UpdateReview } from './review.interface';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private userService: UserService,
    private releaseService: ReleaseService,
    private sensitiveService: SensitiveService,
  ) {}

  async findOne(id: number) {
    return await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.childReview', 'child')
      .where('review.id=:id', { id: +id })
      .getOne();
  }

  /**
   * 创建第一条评论
   */
  async create(dto: ReviewInterface, username: string) {
    const userEntity = await this.userService.findNameOne(username);
    await this.sensitiveService.sensitiveCheck(dto.text);
    const releaseEntity = await this.releaseService.findOne(dto.id);
    await this.reviewRepository.insert({
      username: dto.username,
      text: dto.text,
      createTime: new Date(),
      release: releaseEntity,
      user: userEntity,
    });
  }

  async update(id: number, dto: UpdateReview) {
    const entity = await this.findOne(id);
    const updateEntity = this.reviewRepository.merge(entity, dto);
    return this.reviewRepository.save(updateEntity);
  }
}
