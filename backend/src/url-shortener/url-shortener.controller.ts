import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RateLimit } from '../rate-limit/rate-limit.decorator';
import { RateLimitGuard } from '../rate-limit/rate-limit.guard';
import { formatToUrlShortenerPostResponseModel } from './url-shortener.formaters';
import { UrlShortenerService } from './url-shortener.managers';
import {
  UrlShortenerPostBodyModel,
  UrlShortenerPostResponseModel,
  UrlShortenerResolveResponseModel,
} from './url-shortener.models';

@Controller()
export class UrlShortenerController {
  constructor(private readonly service: UrlShortenerService) {}

  @UseGuards(RateLimitGuard)
  @RateLimit({ max: 10, bucketPrefix: 'url-shortener:post' })
  @Post('url-shortener')
  async createUrlShortener(
    @Body() body: UrlShortenerPostBodyModel,
  ): Promise<UrlShortenerPostResponseModel> {
    const urlShortener = await this.service.createUrlShortener(body.url);
    return formatToUrlShortenerPostResponseModel(urlShortener);
  }

  @Get('url-shortener/:hash')
  async redirect(
    @Param('hash') hash: string,
  ): Promise<UrlShortenerResolveResponseModel> {
    const destinationUrl =
      await this.service.resolveRedirectDestination(hash);
    return { destinationUrl };
  }
}
