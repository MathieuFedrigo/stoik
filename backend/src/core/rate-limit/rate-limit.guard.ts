import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TooManyRequestsError } from '@/core/errors/http-error';
import { getRequestClientKey } from '@/core/rate-limit/request-client-key.util';
import { InMemoryRateLimitService } from './in-memory-rate-limit.service';
import {
  DEFAULT_RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_METADATA_KEY,
  RateLimitOptions,
} from './rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly rateLimit: InMemoryRateLimitService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const clientKey = getRequestClientKey(request);
    const bucketKey = `${options.bucketPrefix}:${clientKey}`;

    if (
      !this.rateLimit.tryAcquire(
        bucketKey,
        options.max,
        DEFAULT_RATE_LIMIT_WINDOW_MS,
      )
    ) {
      throw new TooManyRequestsError();
    }

    return true;
  }
}
