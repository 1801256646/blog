import { List, Skeleton, Space, Tabs, Divider } from 'antd';
import React, { FC, useState, useEffect } from 'react';
import InFiniteScroll from 'react-infinite-scroll-component';
import { useHistory, useLocation } from 'react-router-dom';
import { ReleaseOrderBy } from '@/application/enum/release';
import { ReleaseData } from '@/application/service/home';
import { searchList } from '@/application/service/search';
import BodyScreen from '@/presentation/components/body-screen';
import HomeList from '../home/components/home-list';
import styles from './index.module.scss';

const Search: FC = () => {
  const [listLoading, setListLoading] = useState(true);
  const [list, setList] = useState<ReleaseData[]>([]);
  const [total, setTotal] = useState(0);
  const [orderBy, setOrderBy] = useState(ReleaseOrderBy.UpdateTime);
  const [page, setPage] = useState(1);
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('keyword') || '';
  const defaultPageSize = 5;

  const handleSearchList = async () => {
    const { data } = await searchList({
      page,
      pageSize: defaultPageSize,
      orderBy,
      keyword,
    });
    if (page === 1) {
      setList(data?.list);
    } else {
      setList([...list, ...data?.list])
    }
        
    setTotal(data?.total);
  };

  const handleTabsChange = async (key: string) => {
    setOrderBy(key as ReleaseOrderBy);
    setPage(1);
  };

  useEffect(() => {
    const fn = async () => {
      await handleSearchList();
      setListLoading(false);
    };
    fn();
  }, []);

  useEffect(() => {
    handleSearchList();
  }, [orderBy, keyword, page]);

  useEffect(() => {
    setPage(1);
    setOrderBy(ReleaseOrderBy.UpdateTime);
  }, [keyword])

  return (
    <BodyScreen>
      {
        listLoading
          ? <Skeleton />
          : (
            <div className={styles.search}>
              <Tabs type='card' onChange={handleTabsChange} items={[
                { label: '最新优先', key: ReleaseOrderBy.UpdateTime },
                { label: '最热优先', key: ReleaseOrderBy.Browse }
              ]} />
              <InFiniteScroll
                dataLength={list?.length}
                hasMore={list?.length < total}
                loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
                scrollableTarget='search'
                endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
                next={() => {
                  setPage(page + 1);
                }}
              >
                <List
                  dataSource={list}
                  renderItem={(item) => (
                    <Space direction='vertical' style={{ width: '100%' }} onClick={() => history.push(`/detail/${item.id}`)}>
                      <HomeList release={item} keyword={keyword} />
                      <Divider />
                    </Space>
                  )}
                />
              </InFiniteScroll>
            </div>
          )
      }
    </BodyScreen>
  );
};

export default Search;
