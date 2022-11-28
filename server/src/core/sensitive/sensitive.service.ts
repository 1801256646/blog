import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SensitiveService {
  constructor(private httpService: HttpService) {}

  async sensitiveCheck(content) {
    const { data } = await firstValueFrom(
      this.httpService.post('/api/App/Common_BannerWord/Check', {
        content: content || 'test',
        return_data: 1,
        app_key: '1C7D0B3EC4718F8B23E87829F40D76AF',
      }),
    );
    if (data?.err_code !== 0) {
      throw new HttpException(data?.err_msg, HttpStatus.BAD_REQUEST);
    }
  }
}
