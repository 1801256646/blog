import { Release } from '@/basic/release/entity/release.entity';
import { Reply } from '@/basic/reply/entity/reply.entity';
import { Review } from '@/basic/review/entity/review.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ charset: 'utf8mb4' })
  username: string;

  @Column({ length: 16, charset: 'utf8mb4' })
  cname: string;

  @Column({ name: 'create_time', nullable: true })
  createTime: Date;

  @Column({ type: 'simple-array', nullable: true })
  focus: number[];

  @Column({ type: 'simple-array', nullable: true, comment: '收藏' })
  collection: number[];

  @Column({
    comment: '简介',
    default: '这家伙很懒，啥也没留下。',
    nullable: true,
    charset: 'utf8mb4',
  })
  description: string;

  @Column({ comment: '头像', nullable: true, charset: 'utf8mb4' })
  avatar: string;

  @OneToMany(() => Release, (release) => release.user)
  release: Release[];

  @OneToMany(() => Review, (review) => review.user)
  review: Review[];

  @OneToMany(() => Reply, (reply) => reply.user)
  reply: Reply[];

  @Column({ comment: '粉丝', nullable: true, type: 'simple-array' })
  userFanc: number[];

  @Column({ comment: '关注的人', nullable: true, type: 'simple-array' })
  userFocus: number[];

  @Column({ comment: '个人主页', nullable: true, charset: 'utf8mb4' })
  gitAddress: string;

  @Column({ comment: 'wx用户', nullable: true, name: 'is_wx' })
  isWx: boolean;

  @Column({ comment: '是否是超管', nullable: true })
  admin: number;
}
