import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeormHelperService } from '@/common/typeorm-helper/typeorm-helper.service';
import { SensitiveService } from '@/core/sensitive/sensitive.service';
import { User } from './entity/user.entity';
import { CreateUser, UpdateDto, UserFocus, GetAllUser } from './user.interface';
import { PasswordService } from '../password/password.service';

@Injectable()
export class UserService extends TypeormHelperService<User> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private passwordService: PasswordService,
    private sensitiveService: SensitiveService,
  ) {
    super(userRepository);
  }

  async create() {
    return this.userRepository.createQueryBuilder('user').getManyAndCount();
  }

  async findAll(dto: GetAllUser) {
    const { page = 1, pageSize = 10 } = dto;
    const [list, total] = await this.userRepository
      .createQueryBuilder('user')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return {
      list,
      total,
    };
  }

  async findOne(id: number) {
    if (!id) return;
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async findNameOne(username: string) {
    if (!username) return;
    const data = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.release', 'userRelease')
      .leftJoinAndSelect('user.review', 'userReview')
      .leftJoinAndSelect('user.reply', 'userReply')
      .where('user.username = :username', { username })
      .getOne();
    return data;
  }

  async add(user: CreateUser) {
    const { password, username, cname, isWx, avatar } = user;
    const entity = await this.findNameOne(username);
    if (entity) {
      throw new HttpException('用户名已存在', HttpStatus.BAD_REQUEST);
    }
    await this.sensitiveService.sensitiveCheck(cname);
    const list = await this.userRepository.insert({
      username,
      cname,
      createTime: new Date(),
      isWx,
      avatar,
    });
    const userEntity = await this.findNameOne(username);
    await this.focus({
      userFocus: 1,
      userId: userEntity.id,
    });
    await this.passwordService.add({
      username,
      password,
    });
    if (list) {
      return;
    }
    throw new HttpException('注册用户失败', HttpStatus.BAD_REQUEST);
  }

  async focus(dto: UserFocus) {
    const { userFocus, userId } = dto;
    const entity = await this.findOne(userId);
    const userFocusEntity = await this.findOne(userFocus);
    if (!entity) {
      throw new HttpException('当前用户不存在', HttpStatus.BAD_REQUEST);
    }
    if (entity.userFocus?.find((item) => item === userFocus)) {
      const remote = { ...entity };
      remote.userFocus.splice(
        remote.userFocus.findIndex((item) => item === userFocus),
        1,
      );
      await this.update(entity.username, {
        userFocus: remote.userFocus,
      });
      const removeEntity = { ...userFocusEntity };
      removeEntity.userFanc.splice(
        removeEntity.userFanc.findIndex((item) => item === userId),
        1,
      );
      const updateEntity = await this.update(userFocusEntity.username, {
        userFanc: removeEntity.userFanc,
      });
      return updateEntity;
    }

    await this.update(entity.username, {
      userFocus: [...(entity?.userFocus || []), userFocus],
    });
    const updateEntity = await this.update(userFocusEntity.username, {
      userFanc: [...(userFocusEntity?.userFanc || []), userId],
    });
    return updateEntity;
  }

  async update(name: string, updateDto: UpdateDto) {
    const entity = await this.findNameOne(name);
    const updateEntity = this.userRepository.merge(entity, updateDto);
    return this.userRepository.save(updateEntity);
  }
}
