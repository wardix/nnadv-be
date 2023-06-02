import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import winstonConfig from './logger/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig)
  });
//  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService);
  const port = +configService.get('PORT');
  await app.listen(port || 3000);
}
bootstrap();
