import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryRateLimitService {
  private readonly hits = new Map<string, number[]>();

  tryAcquire(key: string, max: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    const timestamps = this.hits.get(key) ?? [];
    const recent = timestamps.filter((t) => t > windowStart);

    if (recent.length >= max) {
      this.hits.set(key, recent);
      return false;
    }

    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }
}
