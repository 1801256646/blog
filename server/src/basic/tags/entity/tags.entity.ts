import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tags {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '标签',
    charset: 'utf8mb4',
  })
  tag: string;

  @Column({
    comment: '数量',
    default: 0,
  })
  number: number;
}
