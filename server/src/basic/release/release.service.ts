import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '@/core/user/user.service';
import { ReleaseStatus } from '@/common/enum/release';
import { ApproverService } from '@/core/approver/approver.service';
import { TypeormHelperService } from '@/common/typeorm-helper/typeorm-helper.service';
import { SensitiveService } from '@/core/sensitive/sensitive.service';
import { Release } from './entity/release.entity';
import { ReleaseDto, ApproverDto, UpdateDto } from './release.interface';

@Injectable()
export class ReleaseService extends TypeormHelperService<Release> {
  constructor(
    @InjectRepository(Release)
    private releaseRepository: Repository<Release>,
    private userService: UserService,
    private approverService: ApproverService,
    private sensitiveService: SensitiveService,
  ) {
    super(releaseRepository);
  }

  async findOne(id: number) {
    return await this.releaseRepository
      .createQueryBuilder('release')
      .leftJoinAndSelect('release.review', 'review')
      .leftJoinAndSelect('release.user', 'releaseUser')
      .leftJoinAndSelect('review.childReview', 'reply')
      .leftJoinAndSelect('review.user', 'reviewUser')
      .leftJoinAndSelect('reply.user', 'replyUser')
      .where('release.id=:id', { id: +id })
      .andWhere('release.status=1')
      .getOne();
  }

  async findAll() {
    return await this.releaseRepository.find();
  }

  async release(releaseDto: ReleaseDto, creator: string) {
    const { img, type, title, content, description } = releaseDto;
    if (img?.length > 5) {
      throw new HttpException(
        '发布的图片不能超过5张。',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const userEntity = await this.userService.findNameOne(creator);
      await this.sensitiveService.sensitiveCheck(title);
      await this.sensitiveService.sensitiveCheck(content);
      await this.sensitiveService.sensitiveCheck(description);
      const approverEntity = await this.approverService.find();
      await this.releaseRepository.insert({
        ...releaseDto,
        img,
        createTime: new Date(),
        updateTime: new Date(),
        status: ReleaseStatus.Success,
        owner: approverEntity.owner,
        focus: 0,
        browse: 0,
        user: userEntity,
        type,
        creator,
      });
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 获取当前用户待审批的文章
   */
  async getApproverList(owner: string) {
    const listEntity = await this.findAll();
    const approverList = listEntity.filter((item) => {
      return (
        item.owner.split(';').includes(owner) &&
        item.status === ReleaseStatus.UnApproval
      );
    });
    return approverList;
  }

  /**
   * 审批当前文章
   */
  async approver(data: ApproverDto) {
    const { id, status, username } = data;
    const releaseEntity = await this.findOne(id);
    if (releaseEntity.owner.split(';').includes(username)) {
      await this.update(id, { status });
    }
  }

  async update(id: number, updateDto: UpdateDto) {
    const entity = await this.findOne(id);
    const updateEntity = this.releaseRepository.merge(entity, updateDto);
    return this.releaseRepository.save(updateEntity);
  }
}
