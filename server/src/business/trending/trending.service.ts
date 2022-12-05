import { Injectable } from '@nestjs/common';
import { ReleaseService } from '@/basic/release/release.service';
import { UserService } from '@/core/user/user.service';
import { HomeListDto } from './trending.interface';

@Injectable()
export class TrendingService {
  constructor(
    private releaseService: ReleaseService,
    private userService: UserService,
  ) {}

  async home(dto: HomeListDto) {
    const { page, pageSize, orderBy, username, isTag } = dto;
    let sort = 'release.updateTime';
    if (orderBy === 'browse') {
      sort = 'release.browse';
    }
    if (orderBy === 'focus') {
      sort = 'release.focus';
    }

    const query = this.releaseService
      .createQueryBuilder('release')
      .leftJoinAndSelect('release.review', 'review')
      .leftJoinAndSelect('review.childReview', 'childReview')
      .leftJoinAndSelect('release.user', 'releaseUser')
      .leftJoinAndSelect('review.user', 'reviewUser')
      .leftJoinAndSelect('childReview.user', 'replyUser')
      .where('release.status=1');

    if (isTag) {
      query.andWhere(`release.tags LIKE '%${orderBy}%'`, {
        tag: orderBy,
      });
    }

    if (username) {
      const userEntity = await this.userService.findNameOne(username);
      if (userEntity?.userFocus) {
        const allUserQuery = await this.userService
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.release', 'userRelease')
          .where('user.id in (:userFocus)', {
            userFocus: userEntity.userFocus,
          })
          .getMany();

        const focusRelease = allUserQuery
          .reduce((pre, cur) => [...pre, ...cur.release], [])
          .map((item) => item.id);

        if (!focusRelease?.length) {
          return {
            total: 0,
            list: [],
          };
        }
        query.andWhere('release.id in (:focusRelease)', {
          focusRelease,
        });
      }
    }

    const [list, total] = await query
      .orderBy(sort, 'DESC')
      .skip(pageSize * (page - 1))
      .take(pageSize)
      .getManyAndCount();

    return {
      total,
      list,
    };
  }
}
