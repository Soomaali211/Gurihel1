import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { loadDotenvForDev, loadEnv } from './config/env';

async function bootstrap() {
  loadDotenvForDev();
  const env = loadEnv(); // fail-fast haddii qiime khatar ah jiro
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  configureApp(app, env);

  if (env.swaggerEnabled) {
    const cfg = new DocumentBuilder().setTitle('GuriHel API').setVersion('0.1.0').addBearerAuth().build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, cfg));
  }

  await app.listen(env.port);
  new Logger('Bootstrap').log(`API wuu socdaa: http://localhost:${env.port}/api/v1/health (${env.nodeEnv})`);
}

bootstrap().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error('API ma bilaaban karin:', err instanceof Error ? err.message : err);
  process.exit(1);
});
