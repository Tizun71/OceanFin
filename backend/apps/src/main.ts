import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import "src/strategies/infrastructure/rewards/get-apy";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 3000;
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('OceanFin API')
    .setDescription('API documentation for OceanFin project')
    .setVersion('1.0')
    .addBearerAuth();

  if (nodeEnv === 'development') {
    swaggerConfig.addServer(`http://localhost:${port}`, 'Local server');
  } else if (nodeEnv === 'staging') {
    swaggerConfig.addServer('https://api.test.com', 'Staging server');
  } else {
    swaggerConfig.addServer('https://api.app.com', 'Production server');
  }

  const document = SwaggerModule.createDocument(app, swaggerConfig.build());
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
}

bootstrap();
