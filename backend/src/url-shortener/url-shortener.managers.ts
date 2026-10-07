import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundError, TryAgainLaterError } from '../common/http-error';
import { isUniqueConstraintViolation } from '../utils/db.util';
import { generateHash, HASH_PATTERN } from '../utils/hash.util';
import { checkUrlAllowed } from '../utils/security.util';
import { UrlShortener } from './url-shortener.entity';

@Injectable()
export class UrlShortenerService {
  constructor(
    @InjectRepository(UrlShortener)
    private readonly repository: Repository<UrlShortener>,
  ) {}

  async createUrlShortener(url: string): Promise<UrlShortener> {
    await checkUrlAllowed(url);

    const hash = generateHash();

    const urlShortener = this.repository.create({ url, hash });
    try {
      return await this.repository.save(urlShortener);
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new TryAgainLaterError();
      }
      throw error;
    }
  }

  async resolveRedirectDestination(hash: string): Promise<string> {
    if (!HASH_PATTERN.test(hash)) {
      throw new NotFoundError();
    }

    const urlShortener = await this.repository.findOne({ where: { hash } });
    if (!urlShortener) {
      throw new NotFoundError();
    }

    await checkUrlAllowed(urlShortener.url, 'redirect');
    return urlShortener.url;
  }
}
