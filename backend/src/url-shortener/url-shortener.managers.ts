import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateHash } from '../utils/generate-hash.util';
import {
  checkUrlAllowed,
  UnacceptableAddressError,
} from '../utils/security.util';
import { UrlShortener } from './url-shortener.entity';

/** Matches `generateHash()` output (8 alphanumeric characters). */
const HASH_PATTERN = /^[A-Za-z0-9]{8}$/;

@Injectable()
export class UrlShortenerService {
  constructor(
    @InjectRepository(UrlShortener)
    private readonly repository: Repository<UrlShortener>,
  ) {}

  async createUrlShortener(url: string): Promise<UrlShortener> {
    try {
      await checkUrlAllowed(url);
    } catch (err) {
      if (err instanceof UnacceptableAddressError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }

    const hash = generateHash();

    const urlShortener = this.repository.create({ url, hash });
    return this.repository.save(urlShortener);
  }

  async resolveRedirectDestination(hash: string): Promise<string> {
    if (!HASH_PATTERN.test(hash)) {
      throw new NotFoundException();
    }

    const urlShortener = await this.repository.findOne({ where: { hash } });
    if (!urlShortener) {
      throw new NotFoundException();
    }

    await checkUrlAllowed(urlShortener.url);
    return urlShortener.url;
  }
}
