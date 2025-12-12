import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import helmet from "helmet";
import * as express from 'express';




async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation for all request inputs (Body, Param, Query) using DTO rules
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }))

  // Apply Middleware
  app.use(helmet());

  // Serve Swagger static assets for Vercel
  const swaggerUiAssets = require('swagger-ui-dist').absolutePath();
  app.use('/swagger-assets', express.static(swaggerUiAssets));

  // Swagger
  const swagger = new DocumentBuilder()
    .setTitle('E-Commerce API (NestJS)')
    .setDescription('REST API documentation for E-Commerce application built with NestJS')
    .setVersion("1.0")
    .addServer('https://nestjs-ecommerce-app.vercel.app')
    .addSecurity('bearer', { type: 'http', scheme: 'bearer' })
    .addBearerAuth()
    .build();
  const documentation = SwaggerModule.createDocument(app, swagger);

  // http://localhost:3000/swagger
  SwaggerModule.setup("swagger", app, documentation, {
    customCssUrl: '/swagger-assets/swagger-ui.css',
    customJs: '/swagger-assets/swagger-ui-bundle.js',
    customfavIcon: '/swagger-assets/favicon-32x32.png'
  });
  // Running the App
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
