import { Injectable } from '@nestjs/common';
import { Brackets } from 'typeorm';
import { ReleaseService } from '@/basic/release/release.service';
import { SearchDto } from './search.dto';

@Injectable()
export class SearchService {
  constructor(private releaseService: ReleaseService) {}

  async search(dto: SearchDto) {
    const { keyword, page, pageSize, orderBy } = dto;
    let sort = 'release.createTime';
    const query = this.releaseService
      .createQueryBuilder('release')
      .leftJoinAndSelect('release.user', 'user')
      .leftJoinAndSelect('release.review', 'review')
      .leftJoinAndSelect('review.childReview', 'reply')
      .where('release.status = 1');

    if (keyword) {
      query.andWhere(
        new Brackets((qb) =>
          qb
            .where(`release.title LIKE '%${keyword}%'`)
            .orWhere(`release.description LIKE '%${keyword}%'`)
            .orWhere(`release.content LIKE '%${keyword}%'`)
            .orWhere(`release.tags LIKE '%${keyword}%'`),
        ),
      );
    }

    if (orderBy === 'browse') {
      sort = 'release.browse';
    }

    const [list, total] = await query
      .orderBy(sort, 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
    };
  }
}
