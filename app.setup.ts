import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import type { Env } from './config/env';

/** Hal meel oo ay ku jiraan dejinta amniga — main.ts iyo tijaabooyinka (e2e) labaduba waa isticmaalaan. */
export function configureApp(app: NestExpressApplication, env: Env): void {
  app.disable('x-powered-by');
  // Haddii API-ga ka danbeeyo reverse proxy (Nginx/ALB), fur kan si IP rate-limit u shaqeeyo:
  // app.set('trust proxy', 1);
  app.use(helmet());
  app.enableCors({
    origin: env.corsOrigins, // liis cad; ha isticmaalin '*' production
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ka tir fields aan DTO ku jirin
      forbidNonWhitelisted: true, // 400 haddii fields qalloocan la helo
      transform: true,
    }),
  );
  app.enableShutdownHooks();
}
