import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; 
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-axceptions.filter';
import { env } from 'process';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
       origin: process.env.URL_FRONT ?? 'http://localhost:3001',
      credentials: true,
    },
  });
  //console.log('CORS origin permitido:', process.env.URL_FRONT);


  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // 👇 Aquí va la configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Certificados API')
    .setDescription('Documentación oficial del API de certificados')
    .setVersion('1.0')
    .addBearerAuth() // si usas JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // <-- ruta donde se verá la documentación

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();