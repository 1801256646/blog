import { ReadOutlined , LikeFilled, LikeOutlined, MessageOutlined } from '@ant-design/icons';
import { Avatar, Tooltip, Comment, Typography, Space, message, Tag, Image } from 'antd';
import { observer } from 'mobx-react';
import moment from 'moment';
import React, { FC, useState, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { ReleaseData } from '@/application/service/home';
import { focusRelease } from '@/application/service/release';
import useAuth from '@/presentation/store/use-auth';
import { getUpdateAtLabel } from '@/utils/time';
import styles from './index.module.scss';

const { Paragraph } = Typography;

export const Mark = ({ name, keyword }: { name: string; keyword: string }) => {
  if (!keyword) {
    return <>{name}</>;
  }
  const arr = name?.split(keyword);
  return (
    <>
      {arr?.map((str, index) => (
        <span key={index}>
          {str}
          {index === arr.length - 1 ? null : (
            <span style={{ color: "red" }}>{keyword}</span>
          )}
        </span>
      ))}
    </>
  );
};

const HomeList: FC<{ release: ReleaseData, keyword?: string }> = (props) => {
  const { release, keyword } = props;
  const { user, loginUser } = useAuth();
  const history = useHistory();
  const [likes, setLikes] = useState(release.focus || 0);
  const [action, setAction] = useState<string | null>('open');

  const like = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    const { code } = await focusRelease({
      releaseId: release.id,
    })
    if (code === 0) {
      message.success(action === 'open' ? '取消点赞成功' : '点赞成功');
      setLikes(action === 'open' ? (likes - 1) : (likes + 1));
      setAction(action === 'open' ? 'off' : 'open');
      loginUser();
    }
  };
    
  useEffect(() => {
    if (user?.focus?.includes(String(release.id))) {
      setAction('open');
    } else {
      setAction('off');
    }
  }, [user]);

  const commentSum = useMemo(() => release?.review?.reduce((pre, cur) => pre + 1 + cur.childReview.length, 0), [release]);

  const actions = [
    <Space onClick={(e) => like(e)} size={2}>
      {action === 'off' ? <LikeOutlined /> : <LikeFilled />}
            点赞
      <span className="comment-action">{likes}</span>
    </Space>,
    <Space size={2}>
      <ReadOutlined />浏览
      <span>{release.browse}</span>
    </Space>,
    <Space size={2}>
      <MessageOutlined />
            评论
      <span className="comment-action">{commentSum}</span>
    </Space>
  ];

  return (
    <Comment
      actions={actions}
      className={styles.homeList}
      author={release.user?.cname || release.user?.username}
      avatar={<Avatar
        size={40}
        src={release.user?.avatar}
        onClick={(e) => {
          e?.stopPropagation();
          history.push(`/user/${release.user?.id}`)
        }}
      >
        {(user?.username?.[0] || 'u').toLocaleUpperCase()}
      </Avatar>}
      content={
        <div>
          <p className={styles.title}><Mark name={release.title} keyword={keyword || ''} /></p>
          <Paragraph ellipsis={{ rows: 3 }} className={styles.content}>
            <Mark name={release.description ?? release.content} keyword={keyword || ''} />
          </Paragraph>
          <div className={styles.homeListImage} onClick={(e) => e.stopPropagation()}>
            <Image.PreviewGroup>
              {release?.img?.map((item, index) => (
                <Image alt='' src={item} key={index} />
              ))}
            </Image.PreviewGroup>
          </div>
          <div className={styles.tags}>
            {release?.tags?.map((item, idx) => <Tag key={idx}>{item}</Tag>)}
          </div>
        </div>
      }
      datetime={
        <Tooltip title={moment(release.updateTime).format('YYYY-MM-DD HH:mm:ss')}>
          <span>{getUpdateAtLabel(release.updateTime)}发布</span>
        </Tooltip>
      }
    ></Comment>
  );
};

export default observer(HomeList);
