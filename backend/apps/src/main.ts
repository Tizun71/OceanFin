import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('OceanFin API')
    .setDescription('API documentation for OceanFin project')
    .setVersion('1.0')
    .addBearerAuth()

    // Server configurations
    .addServer('http://localhost:3000', 'Local host')
    .addServer('https://api.test.com', 'Development server')
    .addServer('https://api.app.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();
