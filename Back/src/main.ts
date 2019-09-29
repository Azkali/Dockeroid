import { config } from 'dotenv';
import { resolve } from 'path';

// TODO: Do proper injection
config();

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create( AppModule );
  app.useLogger( app.get( 'NestWinston' ) );
  await app.listen( 3000 );
}
bootstrap();
