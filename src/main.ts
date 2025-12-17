import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS (لازم قبل Swagger)
  app.enableCors({
    origin: '*',
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Helmet (مهم تعطيل CSP)
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );


  // Swagger Config
  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
