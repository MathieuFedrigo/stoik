import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from '@/api/health/health.module';
import { UrlShortenerModule } from '@/api/url-shortener/url-shortener.module';
import { getDatabaseConfig } from '@/core/database/database.config';
import { RateLimitModule } from '@/core/rate-limit/rate-limit.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    RateLimitModule,
    HealthModule,
    UrlShortenerModule,
  ],
})
export class AppModule {}
