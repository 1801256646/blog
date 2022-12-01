const { SENSITIVE_APPKEY } = process.env;
import { registerAs } from '@nestjs/config';

export default registerAs('sensitive', () => ({
  appKey: SENSITIVE_APPKEY,
}));
