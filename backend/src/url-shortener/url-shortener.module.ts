import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlShortener } from './url-shortener.entity';
import { UrlShortenerController } from './url-shortener.controller';
import { UrlShortenerService } from './url-shortener.managers';

@Module({
  imports: [TypeOrmModule.forFeature([UrlShortener])],
  controllers: [UrlShortenerController],
  providers: [UrlShortenerService],
})
export class UrlShortenerModule {}
