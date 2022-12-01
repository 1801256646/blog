import { UserOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Avatar, Button, Card, Form, Input, message, Tabs, Upload } from 'antd';
import { observer } from 'mobx-react';
import React, { FC, useEffect, useState } from 'react';
import { UpdateUser, getUserInfo } from '@/application/service/user';
import BodyScreen from '@/presentation/components/body-screen';
import useAuth from '@/presentation/store/use-auth';
import { rule } from '@/types/user';
import { uploadCosFile } from '@/utils/file-cos';
import styles from './index.module.scss';
// import type { UploadProps } from 'antd/es/upload';
import type { RcFile, UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';

const { TabPane } = Tabs;

const UserSetting: FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [userForm] = Form.useForm();
  const [fileUrl, setFileUrl] = useState<string>('');

  const { run: updateUserRun, loading } = useRequest(UpdateUser, {
    manual: true,
    onSuccess: () => {
      message.success('修改成功');
    },
  });

  const { data } = useRequest(() => getUserInfo(`${user?.id}` || ''), {
    ready: !!user?.id,
  });

  //   const handleChange: UploadProps['onChange'] = async (info) => { 
   
  //   };

  const handleFinish = (value: Record<string, string>) => {
    const { cname, description, gitAddress } = value;
    updateUserRun({
      username: user?.username,
      cname,
      description,
      avatar: fileUrl,
      gitAddress,
    });
  };

  const handleUserFinish = (value: Record<string, string>) => {
    const { username, password } = value;
    updateUserRun({
      password,
      username,
    });
  };
    
  const handleCustomReques = async (options: RcCustomRequestOptions) => {
    console.log({
      SecretId: process.env.SECRETID || '',
      SecretKey: process.env.SECRETKEY || '',
    })
    console.log(process.env)
    const { file, onSuccess, onError } = options;
    try {
      const url = await uploadCosFile(file as RcFile);
      onSuccess?.(url);
      setFileUrl(url);
    } catch (err) {
      onError?.(err as Error);
      console.error(err);
    }
  }

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        ...data?.data,
      })
      setFileUrl(data?.data?.avatar);
      userForm.setFieldsValue({
        username: data?.data?.username,
      });
    };
  }, [data]);

  return (
    <BodyScreen className={styles.user}>
      <Tabs tabPosition='left'>
        <TabPane tab='个人资料' key='info'>
          <Card title='个人资料'>
            <Form
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 18 }}
              form={form}
              onFinish={handleFinish}
            >
              <Form.Item label='头像'>
                <Upload
                  accept='.png, .webp, .jpg, .gif, .jpeg'
                  //   onChange={handleChange}
                  customRequest={handleCustomReques}
                >
                  <Avatar size={180} src={fileUrl} icon={<UserOutlined />} />
                </Upload>
              </Form.Item>
              <Form.Item label='昵称' name='cname' rules={rule.cname}>
                <Input placeholder='请输入昵称' />
              </Form.Item>
              <Form.Item label='个人签名' name='description' required>
                <Input.TextArea placeholder='请输入个人签名' />
              </Form.Item>
              <Form.Item label='个人主页' name='gitAddress'>
                <Input placeholder='请输入个人主页' />
              </Form.Item>
              <Button type='primary' htmlType='submit' className={styles.submitBtn} loading={loading}>保存</Button>
            </Form>
          </Card>
        </TabPane>
        <TabPane tab='账号信息' key='user'>
          <Card title='账号信息'>
            <Form
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 18 }}
              form={userForm}
              onFinish={handleUserFinish}
            >
              <Form.Item name='username' label='用户名'>
                <Input placeholder='请输入用户名' disabled />
              </Form.Item>
              <Form.Item name='password' label='密码' rules={rule.password}>
                <Input.Password placeholder='请输入密码'/>
              </Form.Item>
              <Button type='primary' htmlType='submit' className={styles.submitBtn} loading={loading}>保存</Button>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </BodyScreen>
  );
};

export default observer(UserSetting);
