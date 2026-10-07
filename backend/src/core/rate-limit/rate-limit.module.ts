import { Global, Module } from '@nestjs/common';
import { InMemoryRateLimitService } from './in-memory-rate-limit.service';
import { RateLimitGuard } from './rate-limit.guard';

@Global()
@Module({
  providers: [InMemoryRateLimitService, RateLimitGuard],
  exports: [InMemoryRateLimitService, RateLimitGuard],
})
export class RateLimitModule {}
