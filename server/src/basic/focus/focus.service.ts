import { Injectable } from '@nestjs/common';
import { ReleaseService } from '@/basic/release/release.service';
import { UserService } from '@/core/user/user.service';
import { FocusDto, CollectionDto } from './focus.interface';

@Injectable()
export class FocusService {
  constructor(
    private releaseService: ReleaseService,
    private userService: UserService,
  ) {}

  async focus(dto: FocusDto, username: string) {
    const { releaseId } = dto;
    const userEntity = await this.userService.findNameOne(username);
    const releaseEntity = await this.releaseService.findOne(releaseId);
    if (userEntity?.focus?.find((item) => item === releaseId)) {
      const remote = { ...userEntity };
      remote.focus.splice(
        remote.focus.findIndex((item) => item === releaseId),
        1,
      );
      const updateUser = await this.userService.update(username, {
        focus: remote.focus,
      });
      await this.releaseService.update(releaseId, {
        focus: releaseEntity.focus - 1,
      });
      return updateUser;
    }

    await this.releaseService.update(releaseId, {
      focus: releaseEntity.focus + 1,
    });
    const updateUser = await this.userService.update(username, {
      focus: [...(userEntity?.focus || []), releaseId],
    });
    return updateUser;
  }

  async collection(dto: CollectionDto, username: string) {
    const { releaseId } = dto;
    const userEntity = await this.userService.findNameOne(username);
    if (userEntity?.collection?.find((item) => item === releaseId)) {
      const remote = { ...userEntity };
      remote.collection.splice(
        remote.collection.findIndex((item) => item === releaseId),
        1,
      );
      const updateUser = await this.userService.update(username, {
        collection: remote.collection,
      });
      return updateUser;
    }
    const updateUser = await this.userService.update(username, {
      collection: [...(userEntity?.collection || []), releaseId],
    });
    return updateUser;
  }

  async browse(releaseId: number) {
    const releaseEntity = await this.releaseService.findOne(releaseId);
    const updateEntity = await this.releaseService.update(releaseId, {
      browse: (releaseEntity.browse || 0) + 1,
    });
    return updateEntity;
  }
}
