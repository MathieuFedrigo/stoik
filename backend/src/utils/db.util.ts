import { QueryFailedError } from 'typeorm';

/** PostgreSQL unique_violation */
const PG_UNIQUE_VIOLATION = '23505';

export function isUniqueConstraintViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }
  const driverError = error.driverError as { code?: string };
  return driverError.code === PG_UNIQUE_VIOLATION;
}
