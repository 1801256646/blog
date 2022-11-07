import { ReadOutlined , LikeFilled, LikeOutlined, MessageOutlined } from '@ant-design/icons';
import { Avatar, Tooltip, Comment, Typography, Space, message } from 'antd';
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

const HomeList: FC<{ release: ReleaseData }> = (props) => {
    const { release } = props;
    const { user, isLogin, loginUser } = useAuth();
    const history = useHistory();
    const [likes, setLikes] = useState(release.focus || 0);
    const [action, setAction] = useState<string | null>('open');

    const like = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        if (!isLogin) {
            message.info('请先登陆');
            setTimeout(() => history.push('/login'), 1000);
        }
        const { code } = await focusRelease({
            username: user?.username || '',
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
        <Space onClick={(e) => like(e)} size={2}>
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
                    <p className={styles.title}>{release.title}</p>
                    <Paragraph ellipsis={{ rows: 3 }} className={styles.content}>{release.content}</Paragraph>
                    <div className={styles.homeListImage}>
                        {release?.img?.map((item, index) => (
                            <img alt='' src={item} key={index} />
                        ))}
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
