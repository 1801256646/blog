import COS from 'cos-js-sdk-v5';
import { SECRETKEY, SECRET_ID, REGION, BUCKET } from '@/config/env-config';

export const uploadCosFile = async (file: File) => {
  const cos = new COS({
    SecretId: SECRET_ID,
    SecretKey: SECRETKEY,
  });
  const uploadInfo = await cos.uploadFile({
    Bucket: BUCKET || '',
    Region: REGION || '',
    Key: `${new Date().getTime()}.${file.name.split('.').pop()}`,
    Body: file,
  });

  return `https://${uploadInfo.Location}`
}