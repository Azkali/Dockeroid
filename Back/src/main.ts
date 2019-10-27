import { config } from 'dotenv';
import { resolve } from 'path';

// TODO: Do proper injection
config();

import { NestFactory } from '@nestjs/core';

import { Logger } from 'winston';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create( AppModule );
	app.useLogger( app.get( 'NestWinston' ) );

	const port = process.env.PORT ? parseInt( process.env.PORT, 10 ) : 4000;
	( app.get( 'NestWinston' ).logger as Logger ).info( `Starting app on port ${port}` );
	await app.listen( port );
}
bootstrap();
