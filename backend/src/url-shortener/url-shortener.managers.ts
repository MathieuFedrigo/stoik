import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateHash } from '../utils/generate-hash.util';
import { UrlShortener } from './url-shortener.entity';

@Injectable()
export class UrlShortenerService {
  constructor(
    @InjectRepository(UrlShortener)
    private readonly repository: Repository<UrlShortener>,
  ) {}

  async createUrlShortener(url: string): Promise<UrlShortener> {
    const hash = generateHash();

    const urlShortener = this.repository.create({ url, hash });
    return this.repository.save(urlShortener);
  }
}
