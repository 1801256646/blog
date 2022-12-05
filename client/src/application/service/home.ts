import { ReleaseOrderBy } from '@/application/enum/release';
import { ReleaseType, ReleaseStatus } from '@/application/enum/release';
import client, { CommonAPI } from './request';
import { UserData } from './user';

export type getHomeListReq = {
    page: number;
    pageSize: number;
    orderBy?: ReleaseOrderBy;
    username?: string;
    isTag?: boolean;
}
export type getHomeListRes = {
    total: number;
    list: ReleaseData[];
}

export type ReleaseData = {
    id: number;
    title: string;
    description: string;
    content: string;
    createTime: string;
    updateTime: string;
    creator: string;
    focus: number;
    browse: number;
    review: ReviewData[];
    img?: string[];
    user?: UserData;
    type: ReleaseType;
    status?: ReleaseStatus;
    tags?: string[];
}

export type ReviewData = {
    id: number;
    username: string;
    text: string;
    createTime: string;
    childReview: ReplyData[];
    user?: UserData;
}

export type ReplyData = ReviewData & {
    replier?: string;
}

export type TagsData = {
    id: number;
    tag: string;
    number: number;
}

// 发布帖子
export const getHomeList = async (data: getHomeListReq): Promise<CommonAPI<getHomeListRes>> => {
  const res = await client.post({
    url: '/trending',
    data,
  });
  return res.data;
};

// 获取前三个发布量最高的tag
export const getTagsList = async (): Promise<CommonAPI<TagsData[]>> => {
  const res = await client.get({
    url: '/tags',
  });
  return res.data;
};
