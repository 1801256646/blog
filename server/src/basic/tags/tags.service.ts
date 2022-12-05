import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Tags } from './entity/tags.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tags)
    private tagsRepository: Repository<Tags>,
  ) {}

  async add(tag: string) {
    const entity = await this.tagsRepository.findOne({
      where: {
        tag,
      },
    });
    if (entity) {
      const updateEntity = this.tagsRepository.merge(entity, {
        number: entity.number + 1,
      });
      await this.tagsRepository.save(updateEntity);
    } else {
      await this.tagsRepository.insert({
        tag,
        number: 1,
      });
    }
  }

  async ranking() {
    const data = await this.tagsRepository
      .createQueryBuilder('tags')
      .orderBy('number', 'DESC')
      .getMany();
    return data.slice(0, 3);
  }
}
