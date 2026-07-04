import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS configuration
  app.enableCors({
    origin: '*', // Cho phép tất cả các nguồn
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With', 'Origin'],
    exposedHeaders: ['Authorization', 'Content-Type', 'Content-Length'],
    maxAge: 3600,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Baccarat API')
    .setDescription('API documentation for Baccarat game')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('PORT', 1235);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger UI is available at: http://localhost:${port}/api`);
  console.log(`API endpoints are available at: http://localhost:${port}/api/*`);
}
bootstrap();