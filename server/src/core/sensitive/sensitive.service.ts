import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SensitiveService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async sensitiveCheck(content) {
    const { appKey = '' } = this.configService.get('sensitive');
    const { data } = await firstValueFrom(
      this.httpService.post('/api/App/Common_BannerWord/Check', {
        content: content || 'test',
        return_data: 1,
        app_key: appKey,
      }),
    );
    if (data?.err_code !== 0) {
      throw new HttpException(data?.err_msg, HttpStatus.BAD_REQUEST);
    }
  }
}
