import { PlusOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Card, Form, Input, Button, message, Upload, Space, UploadFile, Select } from 'antd';
import { observer } from 'mobx-react';
import React, { FC, useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { ReleaseType } from '@/application/enum/release';
import { getTagsList } from '@/application/service/home';
import { ReleasePost, ReleasePostReq } from '@/application/service/release';
import BodyScreen from '@/presentation/components/body-screen';
import useAuth from '@/presentation/store/use-auth';
import { uploadCosFile } from '@/utils/file-cos';
import MarketDown from './components/marketdown';
import styles from './index.module.scss';
import type { UploadProps } from 'antd/es/upload';
import type { RcFile, UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';

const Release: FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { isLogin } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type');
  const isTips = type === 'tips';
  const title = isTips ? '发布帖子' : '发布文章';
  const [form] = Form.useForm();
  const [contentValue, setValue] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { loading, run } = useRequest(ReleasePost, {
    manual: true,
    onSuccess: () => {
      message.success('发布成功!');
      setTimeout(() => history.push('/'), 1000);
    },
  });
    
  const { data: tagsListData, loading: tagListLoading } = useRequest(() => getTagsList());

  const handleFinish = (value: ReleasePostReq) => {
    const { img } = value;
    run({
      ...value,
      img: img?.fileList?.map((item: any) => item.response),
      type: ReleaseType.Tips,
    });
  };

  const handleEssayClick = async () => {
    await form.validateFields();
    run({
      content: contentValue,
      title: inputValue,
      type: ReleaseType.Article,
      description: form.getFieldValue('description'),
      tags: form.getFieldValue('tags'),
    });
  };

  const handleCustomReques = async (options: RcCustomRequestOptions) => {
    const { file, onSuccess, onError } = options;
    try {
      const url = await uploadCosFile(file as RcFile);
      onSuccess?.(url);
    } catch (err) {
      onError?.(err as Error);
      console.error(err);
    }
  }
    
  const handleChange: UploadProps['onChange']  = (info) => {
    setFileList(info.fileList);
  };
    
  const handleTagsChange = (value: string[]) => {
    if (value.length > 5) {
      message.warning('标签数量不能超过5个！')
      form.setFieldValue('tags', value.slice(0, 5));
    }
  };
    
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      message.info('请先登录');
      setTimeout(() => {
        history.push('/login');
      }, 1000);
    };
  }, [isLogin]);
    
  const options = tagsListData?.data?.map(item => ({
    value: item.tag,
    label: item.tag,
  }));

  return (
    <BodyScreen>
      <Card title={title} className={styles.release}>
        <Form wrapperCol={{ span: 18 }} labelCol={{ span: 3 }} onFinish={handleFinish} form={form}>
          {
            isTips ? (
              <>
                <Form.Item label='标题' name='title' rules={[{ required: true, message: '标题不能为空' }]}>
                  <Input placeholder='请输入标题' />
                </Form.Item>
                <Form.Item name='tags' label='标签'>
                  <Select mode='tags' placeholder='请输入标签' options={options} loading={tagListLoading} onChange={handleTagsChange} />
                </Form.Item>
                <Form.Item label='内容' name='content'>
                  <Input.TextArea placeholder='请输入简介' showCount autoSize={{ minRows: 15 }} />
                </Form.Item>
                <Form.Item label='图片' name='img'>
                  <Upload
                    accept='.png, .webp, .jpg, .gif, .jpeg'
                    customRequest={handleCustomReques}
                    listType="picture-card"
                    onChange={handleChange}
                  >
                    {fileList.length < 5 && <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>}
                  </Upload>
                </Form.Item>
                <Button type='primary' htmlType='submit' className={styles.releaseBtn} loading={loading}>发布</Button></>
            ) : (
              <Space direction='vertical' style={{ width: '100%' }} size={20}>
                <Form.Item name='title' rules={[{ required: true, message: '标题不能为空' }]} wrapperCol={{ span: 24 }}>
                  <Input placeholder='请输入你的标题' className={styles.input} onChange={(e) => setInputValue(e.target.value)} />
                </Form.Item>
                <Form.Item name='description' wrapperCol={{ span: 24 }}>
                  <Input placeholder='请输入描述' className={styles.input} />
                </Form.Item>
                <Form.Item name='tags' wrapperCol={{ span: 24 }}>
                  <Select mode='tags' placeholder='请输入标签' options={options} loading={tagListLoading} onChange={handleTagsChange} />
                </Form.Item>
                <MarketDown setValue={setValue} />
                <Button type='primary' className={styles.releaseBtn} onClick={handleEssayClick} loading={loading}>发布</Button>
              </Space>
            )
          }
        </Form>
      </Card>
    </BodyScreen>
  );
};

export default observer(Release);
