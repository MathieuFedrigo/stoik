import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './database/database.config';
import { UrlShortenerModule } from './url-shortener/url-shortener.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    UrlShortenerModule,
  ],
})
export class AppModule {}
