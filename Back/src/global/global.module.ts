import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { resolve } from 'path';
import winston = require( 'winston' );

import { DockerModule } from '../docker/docker.module';
import { VirshModule } from '../virsh/virsh.module';
import { AppStoreService } from './app-store/app-store.service';
import { AppsController } from './apps/apps.controller';
import { ConfigService } from './config/config.service';
import { ListController } from './list/list.controller';

@Global()
@Module( {
	controllers: [ListController, AppsController],
	exports: [
		WinstonModule,
		AppStoreService,
	],
	imports: [
		WinstonModule.forRoot( {
			format: winston.format.json(),
			level: 'info',
			// defaultMeta: { service: 'user-service' },
			transports: [
				//
				// - Write to all logs with level `info` and below to `combined.log`
				// - Write all logs error (and below) to `error.log`.
				//
				new winston.transports.File( { filename: resolve( process.env.LOGS_DIR!, 'error.log' ), level: 'error' } ),
				new winston.transports.File( { filename: resolve( process.env.LOGS_DIR!, 'combined.log' ) } ),
				new winston.transports.Console( {
					format: winston.format.simple(),
				} ),
			],
		} ),
		DockerModule,
		VirshModule,
	],
	providers: [
		AppStoreService,
		{ provide: ConfigService, useValue: new ConfigService( '.env' ) },
	],
} )
export class GlobalModule {}
