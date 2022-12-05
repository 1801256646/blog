import { ReleaseStatus } from '@/common/enum/release';
import { Review } from '@/basic/review/entity/review.entity';

export interface ReleaseDto {
  title: string;

  description?: string;

  img?: string[];

  content: string;

  type: number;

  tags?: string[];
}

export interface ApproverDto {
  id: number;

  status: ReleaseStatus;

  username: string;
}

export interface UpdateDto {
  status?: ReleaseStatus;

  review?: Review[];

  focus?: number;

  browse?: number;
}
