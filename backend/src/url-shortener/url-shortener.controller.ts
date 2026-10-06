import { Body, Controller, Post } from '@nestjs/common';
import { UrlShortenerPostBodyModel, UrlShortenerPostResponseModel } from './url-shortener.models';
import { UrlShortenerService } from './url-shortener.managers';
import { formatToUrlShortenerPostResponseModel } from './url-shortener.formaters';

@Controller('url-shortener')
export class UrlShortenerController {
  constructor(private readonly service: UrlShortenerService) {}

  @Post()
  async createUrlShortener(@Body() body: UrlShortenerPostBodyModel): Promise<UrlShortenerPostResponseModel> {
    const urlShortener = await this.service.createUrlShortener(body.url);

    return formatToUrlShortenerPostResponseModel(urlShortener);
  }
}
