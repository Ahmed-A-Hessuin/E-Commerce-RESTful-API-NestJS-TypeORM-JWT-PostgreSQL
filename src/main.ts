import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import helmet from "helmet";


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

// Enable global validation for all request inputs (Body, Param, Query) using DTO rules
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }))

  // Apply Middleware
  app.use(helmet());

  // Swagger
  const swagger = new DocumentBuilder()
    .setTitle('E-Commerce API (NestJS)')
    .setDescription('REST API documentation for E-Commerce application built with NestJS')
    .setVersion("1.0")
    .addSecurity('bearer', { type: 'http', scheme: 'bearer' })
    .addBearerAuth()
    .build();
  const documentation = SwaggerModule.createDocument(app, swagger);

  // http://localhost:3000/swagger
  SwaggerModule.setup("swagger", app, documentation)

  // Running the App
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
