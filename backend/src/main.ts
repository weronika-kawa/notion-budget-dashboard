import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Włączamy CORS, aby Next.js mógł pobierać dane z NestJS
  app.enableCors();

  await app.listen(3000);
}
bootstrap();