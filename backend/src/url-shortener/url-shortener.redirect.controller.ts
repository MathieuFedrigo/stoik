import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import type { ServerResponse } from 'node:http';
import { UrlShortenerService } from './url-shortener.managers';

/** Matches `generateHash()` output (8 alphanumeric characters). */
const HASH_PATTERN = /^[A-Za-z0-9]{8}$/;

@Controller()
export class UrlShortenerRedirectController {
  constructor(private readonly service: UrlShortenerService) {}

  @Get(':hash')
  async redirect(
    @Param('hash') hash: string,
    @Res() res: ServerResponse,
  ): Promise<void> {
    if (!HASH_PATTERN.test(hash)) {
      throw new NotFoundException();
    }

    const urlShortener = await this.service.findByHash(hash);
    if (!urlShortener) {
      throw new NotFoundException();
    }

    res.statusCode = 302;
    res.setHeader('Location', urlShortener.url);
    res.end();
  }
}
