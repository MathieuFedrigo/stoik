import { UrlShortener } from './url-shortener.entity';
import { UrlShortenerPostResponseModel } from './url-shortener.models';

export function formatToUrlShortenerPostResponseModel(entity: UrlShortener): UrlShortenerPostResponseModel {
  return {
    shortUrl: entity.shortUrl,
    originalUrl: entity.url,
  };
}
