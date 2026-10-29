import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { config } from './config';
import { TransformInterceptor } from './interceptors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import { CustomLogger } from './services/customLogger';
import { morganMiddleware } from './interceptors/morgon-middleware';

async function bootstrap() {
  const logger = new Logger(config.SERVICE_NAME);

  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });

  // Behind Nginx — read the real client IP from X-Forwarded-For
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.enableCors({
    origin: config.CORS_ORIGINS
      ? config.CORS_ORIGINS.split(',').map((origin) => origin.trim())
      : ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(morganMiddleware);
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());

  await app.startAllMicroservices();

  if (config.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Nest Boiler Plate API')
      .setDescription('API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
    logger.verbose('Swagger enabled at /api');
  }

  await app.listen(config.PORT, () =>
    logger.verbose(`App started on port: ${config.PORT}`),
  );
}

bootstrap();
