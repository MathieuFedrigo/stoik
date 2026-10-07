import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_METADATA_KEY = 'rateLimit';

export const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;

export type RateLimitOptions = {
  max: number;
  bucketPrefix: string;
};

export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_METADATA_KEY, options);
