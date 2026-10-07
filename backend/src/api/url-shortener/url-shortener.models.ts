export class UrlShortenerPostBodyModel {
  url!: string;
}

export class UrlShortenerPostResponseModel {
  shortUrl!: string;
  originalUrl!: string;
}

export class UrlShortenerResolveResponseModel {
  destinationUrl!: string;
}
