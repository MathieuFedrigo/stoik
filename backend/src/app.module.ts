import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './database/database.config';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { UrlShortenerModule } from './url-shortener/url-shortener.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    RateLimitModule,
    UrlShortenerModule,
  ],
})
export class AppModule {}
