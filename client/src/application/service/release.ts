import { CommentType } from '@/application/enum/release';
import { ReleaseType } from '@/application/enum/release';
import { ReleaseData } from './home';
import client, { CommonAPI } from './request';
import { UserData } from './user';

export type ReleasePostReq = {
    title: string;
    content: string;
    img?: any;
    description?: string;
    type: ReleaseType;
    tags?: string;
}
export type FocusReleaseReq = {
    releaseId: number;
}
export type CommentReleaseReq = {
    text: string;
    id: number;
    type: CommentType;
    replier?: string;
}

export type getIdReleaseRes = {
    total: number;
    list: ReleaseData[];
}

// 发布帖子
export const ReleasePost = async (data: ReleasePostReq): Promise<CommonAPI> => {
  const res = await client.post({
    url: '/release',
    data
  });
  return res.data;
};

// 对文章点赞
export const focusRelease = async (data: FocusReleaseReq): Promise<CommonAPI<UserData>> => {
  const res = await client.get({
    url: '/focus',
    data,
  });
  return res.data;
}

// 获取文章详情
export const releaseDetail = async (id: string): Promise<CommonAPI<ReleaseData>> => {
  const res = await client.get({
    url: '/release',
    data: { id },
  });
  return res.data;
}

// 对文章浏览
export const browseRelease = async (id: string): Promise<CommonAPI> => {
  const res = await client.get({
    url: '/focus/browse',
    data: { id },
  });
  return res.data;
}

// 评论
export const commentRelease = async (data: CommentReleaseReq): Promise<CommonAPI> => {
  const { type } = data;
  const res = await client.post({
    url: type === CommentType.Comment ? 'review' : 'reply',
    data,
  });
  return res.data;
}

// 根据多个id获取文章内容
export const getIdRelease = async (releaseId: number[]): Promise<CommonAPI<getIdReleaseRes>> => {
  const res = await client.post({
    url: '/release/get-ids',
    data: { releaseId },
  });
  return res.data;
}

// 获取所有文章
export const getAllRelease = async (): Promise<CommonAPI<ReleaseData[]>> => {
  const res = await client.get({
    url: '/release/get-all',
  })
  return res.data;
}

// 下掉对应文章帖子
export const removeRelease = async (id: number): Promise<CommonAPI> => {
  const res = await client.delete({
    url: '/release',
    data: { id },
  })
  return res.data;
}
