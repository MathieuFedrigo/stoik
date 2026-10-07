export class AppHttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends AppHttpError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class ForbiddenError extends AppHttpError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class NotFoundError extends AppHttpError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

export class TooManyRequestsError extends AppHttpError {
  constructor(
    message = 'Too many requests, please try again later',
  ) {
    super(message, 429);
  }
}

export class TryAgainLaterError extends AppHttpError {
  constructor(message = 'Please try again later.') {
    super(message, 503);
  }
}
