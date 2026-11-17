import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL || 'https://your-domain.com'
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Gemba Arquitectura IB API')
    .setDescription('API for observing and tracking architect role implementation')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`✓ Application is running on port ${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
