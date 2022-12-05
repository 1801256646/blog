import { UserOutlined, LikeOutlined, LikeFilled, ReadOutlined, HeartOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Avatar, Comment, Card, Typography, Space, Spin, message, Input, Button, Empty, Tag } from 'antd';
import { observer } from 'mobx-react';
import moment from 'moment';
import React, { FC, useState, useEffect, useMemo } from 'react';
import ReactMarkDown from 'react-markdown';
import { useHistory, useParams } from 'react-router-dom';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Zmage from 'react-zmage';
import { CommentType } from '@/application/enum/release';
import { ReleaseStatus } from '@/application/enum/release';
import { releaseDetail, focusRelease, browseRelease, commentRelease, CommentReleaseReq } from '@/application/service/release';
import { getUserInfo, focusUser } from '@/application/service/user';
import BodyScreen from '@/presentation/components/body-screen';
import useAuth from '@/presentation/store/use-auth';
import ChildrenComment from './components/children-comment';
import styles from './index.module.scss'

const { Paragraph } = Typography;

const Detail: FC = () => {
  const { user, loginUser } = useAuth();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [likes, setLikes] = useState<number>(0);
  const [action, setAction] = useState<string>('open');
  const [inputValue, setInputValue] = useState<string>('');

  const { data, loading, run } = useRequest(() => releaseDetail(id), {
    ready: !!id,
    refreshDeps: [id],
    onSuccess: (data) => {
      setLikes(data?.data?.focus || 0);
      data?.data?.review.sort((b, a) => (new Date(b.createTime).getTime() - new Date(a.createTime).getTime()));
    },
  });

  const { data: userData, loading: userLoading, run: getUserRun } = useRequest(() => getUserInfo(`${data?.data?.user?.id}` || ''), {
    ready: !!data?.data?.creator,
  })

  const { run: focusUserRun, loading: focusLoading } = useRequest(focusUser, {
    manual: true,
    onSuccess: () => {
      loginUser();
      getUserRun();
    },
  })

  useRequest(() => browseRelease(id), { ready: !!id });

  const like = async () => {
    const { code } = await focusRelease({
      releaseId: Number(id),
    })
    if (code === 0) {
      message.success(action === 'open' ? '取消点赞成功' : '点赞成功');
      setLikes(action === 'open' ? (likes - 1) : (likes + 1));
      setAction(action === 'open' ? 'off' : 'open');
      loginUser();
    }
  };

  const handleComment = async (props: CommentReleaseReq) => {
    const { code } = await commentRelease(props);
    if (code === 0) {
      message.success('评论成功');
      setInputValue('');
      run();
    }
  };

  const handleFocusUserClick = () => {
    focusUserRun({
      userId: `${user?.id}`,
      userFocus: `${userData?.data?.id}`,
    });
  };

  const commentSum = useMemo(() => data?.data?.review?.reduce((pre, cur) => pre + 1 + cur.childReview.length, 0), [data]);

  const actions = [
    <Space onClick={like}>
      {action === 'off' ? <LikeOutlined /> : <LikeFilled />}
      <span className="comment-action">{`点赞(${likes})`}</span>
    </Space>,
    <Space>
      <ReadOutlined />
      <span>{`浏览（${data?.data?.browse || 0}）`}</span>
    </Space>,
    <Space>
      <HeartOutlined />
      <span>收藏</span>
    </Space>
  ];

  const focusReact = useMemo(() => {
    if (user?.userFocus?.includes(`${data?.data?.user?.id}`)) {
      return <Button
        className={styles.hasFocusBtn}
        onClick={handleFocusUserClick}
        loading={focusLoading}
      >已关注</Button>
    } else if (data?.data?.creator === user?.username) {
      return null;
    } else {
      return <Button
        type='primary'
        className={styles.focusBtn}
        onClick={handleFocusUserClick}
        loading={focusLoading}
      >关注</Button>;
    }
  }, [user?.userFocus, userData]);

  useEffect(() => {
    if (user?.focus?.includes(String(id))) {
      setAction('open');
    } else {
      setAction('off');
    };
  }, [user]);

  data?.data?.review?.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  data?.data?.review?.forEach((item) => {
    item.childReview.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  });

  if (loading || userLoading) {
    return <Spin spinning={loading || userLoading} wrapperClassName={styles.body} />
  };
  
  return (
    <BodyScreen className={styles.detail}>
      {
        data?.data?.status === ReleaseStatus.Success
          ? (
            <>
              <div>
                <Card actions={actions} title={data?.data?.title} className={styles.detailCard}>
                  <Comment
                    author={data?.data?.user?.cname || data?.data?.user?.username}
                    avatar={<Avatar size={40} src={data?.data?.user?.avatar} icon={<UserOutlined />} />}
                    content={
                      <p>
                        发布于{moment(data?.data?.createTime).format('YYYY-MM-DD HH:mm:ss')}
                      </p>
                    }
                  />
                  <Paragraph style={{ 'whiteSpace': 'pre-line' }} className={styles.content}>
                    {data?.data?.content && <ReactMarkDown
                      children={data?.data?.content || ''}components={{
                        code({node, inline, className, children, ...props}) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline && match ? (
                            <SyntaxHighlighter
                              children={String(children).replace(/\n$/, '')}
                              style={dracula}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            />
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    />}
                  </Paragraph>
                  <div className={styles.image}>
                    {data?.data?.img?.map((item, idx) => (
                      <Zmage alt='' src={item} key={idx} />
                    ))}
                  </div>
                  <div className={styles.tags}>
                    {data?.data?.tags?.map((item, idx) => <Tag key={idx}>{item}</Tag>)}
                  </div>      
                </Card>
                <Card className={styles.comments}>
                  <p className={styles.commentsSum}>{`${commentSum}条评论`}</p>
                  <Input.TextArea
                    onChange={(e) => setInputValue(e.target.value)}
                    value={inputValue}
                    autoSize={{ minRows: 5, maxRows: 5 }}
                    placeholder='发布你的评论'
                  />
                  <Button type='primary' className={styles.commentsSubmit} onClick={() => handleComment({
                    type: CommentType.Comment,
                    text: inputValue,
                    id: +id,
                  })}>评论</Button>
                  {
                    data?.data?.review?.map((item) => (
                      <ChildrenComment
                        {...item}
                        key={item.id}
                        type={CommentType.ChildrenComment}
                        handleComment={handleComment}
                      >
                        {
                          item.childReview.map((childItem, idx) => (
                            <ChildrenComment
                              {...childItem}
                              id={item.id}
                              key={idx}
                              type={CommentType.ChildrenComment}
                              handleComment={handleComment}
                            />
                          ))
                        }
                      </ChildrenComment>
                    ))
                  }
                </Card>
              </div>
              <Card className={styles.detailUser} actions={[
                <Space direction='vertical' size={0}>
                                    评论
                  <span className={styles.num}>{(userData?.data?.reply?.length || 0) + (userData?.data?.review?.length || 0)}</span>
                </Space>,
                <Space direction='vertical' size={0}>
                                    话题
                  <span className={styles.num}>{userData?.data?.release?.length || 0}</span></Space>,
                <Space direction='vertical' size={0}>
                                    粉丝
                  <span className={styles.num}>{userData?.data?.userFanc?.length || 0}</span></Space>,
                <Space direction='vertical' size={0}>
                                    关注
                  <span className={styles.num}>{userData?.data?.userFocus?.length || 0}</span></Space>,

              ]}>
                <Space direction='vertical' style={{ textAlign: 'center', width: '100%' }}>
                  <Avatar
                    icon={<UserOutlined />}
                    src={data?.data?.user?.avatar}
                    shape='square'
                    size={70}
                    onClick={() => history.push(`/user/${data?.data?.user?.id}`)}
                  />
                  <span>{data?.data?.user?.cname}</span>
                  <span>{data?.data?.user?.description}</span>
                  {focusReact}
                </Space>
              </Card>
            </>
          )
          : <Empty description='当前暂无该文章' style={{ width: '100%' }} />
      }
    </BodyScreen>
  );
};

export default observer(Detail);
