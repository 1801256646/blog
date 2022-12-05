import { Body, Controller, Post } from '@nestjs/common';
import { TrendingService } from './trending.service';
import { HomeListDto } from './trending.interface';

@Controller('trending')
export class TrendingController {
  constructor(private readonly trendingService: TrendingService) {}

  @Post()
  async home(@Body() body: HomeListDto) {
    return await this.trendingService.home(body);
  }
}
