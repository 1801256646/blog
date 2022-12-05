import { useRequest } from 'ahooks';
import { Card, Tabs, Button, Empty, Spin } from 'antd';
import { observer } from 'mobx-react';
import React, { FC, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { ReleaseOrderBy } from '@/application/enum/release';
import { getHomeList, ReleaseData, getTagsList } from '@/application/service/home';
import { authorList } from '@/application/service/user';
import BodyScreen from '@/presentation/components/body-screen';
import { ReleaseOrderByList } from '@/presentation/config/release';
import useAuth from '@/presentation/store/use-auth';
import HomeList from './components/home-list';
import Leaderboard from './components/leaderboard';
import styles from './index.module.scss';

const { TabPane } = Tabs;
const DEFAULT_PAGINATION = { page: 1, pageSize: 5 };
let tab = ReleaseOrderBy.UpdateTime;

const Home: FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { user, isLogin } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const urlTab = searchParams.get('tab') as ReleaseOrderBy || ReleaseOrderBy.UpdateTime;
  const [orderBy, setOrderBy] = useState(urlTab);
  const [data, setData] = useState<ReleaseData[]>([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const { data: listData, loading } = useRequest(() => getHomeList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    orderBy: orderBy,
    username: orderBy === ReleaseOrderBy.UserFocus ? user?.username : undefined,
    isTag: !ReleaseOrderByList.includes(orderBy),
  }), {
    ready: orderBy === ReleaseOrderBy.UserFocus ? !!user?.username : true,
    refreshDeps: [orderBy, pagination],
    onSuccess: (dataList) => {
      if (tab === orderBy) {
        setData([...data, ...dataList?.data?.list || []]);
      } else {
        setData(dataList?.data?.list);
        tab = orderBy;
      }
    },
  });

  const { data: authorListData, loading: authorListLoading } = useRequest(() => authorList());
    
  const { data: tagsListData, loading: getTagsListLoading } = useRequest(() => getTagsList());

  const handleTabsChange = (key: string) => {
    setOrderBy(key as ReleaseOrderBy);
    setPagination(DEFAULT_PAGINATION);
    history.push(`?tab=${key}`);
  };

  return (
    <Spin spinning={getTagsListLoading || authorListLoading}>
      <BodyScreen className={styles.home}>
        <div>
          <Tabs tabPosition='left' onChange={handleTabsChange} className={styles.leftTabs} activeKey={orderBy}>
            <TabPane key='updateTime' tab='最新发布' />
            <TabPane key='browse' tab='浏览量' />
            <TabPane key='focus' tab='点赞量' />
            {isLogin && <TabPane key='userFocus' tab='关注的人' />}
            {
              tagsListData?.data?.map(item => (
                <TabPane key={item.tag} tab={item.tag} />
              ))
            }
          </Tabs>
        </div>
        <div className={styles.list}>
          {
            data?.length ? data?.map(item => (
              <Card key={item.id} className={styles.package} onClick={() => history.push(`/detail/${item.id}`)}>
                <HomeList release={item} />
              </Card>
            )) : <Card><Empty description='当前暂无发布内容' /></Card>
          }
          {
            (listData?.data?.total || 0) > data.length && (
              <Button
                onClick={() => setPagination({ page: pagination.page + 1, pageSize: pagination.pageSize })}
                loading={loading}
                disabled={loading}
                className={styles.loadingBtn}
                type='primary'
              >
                查看更多
              </Button>
            )
          }
        </div>
        <Leaderboard list={authorListData?.data} />
      </BodyScreen>
    </Spin>
  );
};

export default observer(Home);
