import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Review } from '@/basic/review/entity/review.entity';
import { User } from '@/core/user/entity/user.entity';

@Entity()
export class Release {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '发布标题', charset: 'utf8mb4' })
  title: string;

  @Column({ comment: '发布简介', nullable: true, charset: 'utf8mb4' })
  description: string;

  @Column({
    nullable: true,
    comment: '发布图片',
    type: 'simple-array',
    charset: 'utf8mb4',
  })
  img: string[];

  @Column({
    nullable: true,
    comment: '发布内容',
    type: 'mediumtext',
    charset: 'utf8mb4',
  })
  content: string;

  @Column({ name: 'create-time', comment: '创建时间' })
  createTime: Date;

  @Column({ name: 'update-time', comment: '更新时间' })
  updateTime: Date;

  @Column({ comment: '创建人', charset: 'utf8mb4' })
  creator: string;

  @Column({ comment: '状态' })
  status: number;

  @Column({ comment: '审批人', charset: 'utf8mb4' })
  owner: string;

  @Column({ comment: '点赞量' })
  focus: number;

  @Column({ comment: '访问量' })
  browse: number;

  @Column({ comment: '发布类型' })
  type: number;

  @OneToMany(() => Review, (entity) => entity.release)
  @JoinColumn({ name: 'revoew_id' })
  review: Review[];

  @ManyToOne(() => User, (user) => user.release)
  user: User;

  @Column({
    comment: '标签',
    type: 'simple-array',
    charset: 'utf8mb4',
  })
  tags: string[];
}
