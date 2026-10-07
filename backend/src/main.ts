import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    origin: [
      'http://localhost:5174',
      'http://127.0.0.1:5174',
    ],
  });
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`[stoik-backend] listening on http://0.0.0.0:${port}`);
}
bootstrap().catch((err) => {
  console.error('[stoik-backend] failed to start', err);
  process.exit(1);
});
