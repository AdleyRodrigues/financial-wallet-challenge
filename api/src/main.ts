import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const frontendUrl =
    process.env.FRONTEND_URL ??
    process.env.WEB_ORIGIN ??
    'http://localhost:3000';
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3333);
}
void bootstrap();
