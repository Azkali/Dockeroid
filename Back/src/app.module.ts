import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { resolve } from 'path';

import { AppController } from './app.controller';
import { AppStoreService } from './services/app-store/app-store.service';
import { ConfigService } from './services/config/config.service';
import { DockerService } from './services/docker/docker.service';

@Module( {
	imports: [
		WinstonModule.forRoot( {
			level: 'info',
			format: winston.format.json(),
			// defaultMeta: { service: 'user-service' },
			transports: [
				//
				// - Write to all logs with level `info` and below to `combined.log`
				// - Write all logs error (and below) to `error.log`.
				//
				new winston.transports.File( { filename: resolve(process.env.LOGS_DIR!, 'error.log'), level: 'error' } ),
				new winston.transports.File( { filename: resolve(process.env.LOGS_DIR!, 'combined.log') } ),
				new winston.transports.Console({
					format: winston.format.simple()
				})
			],
		} ),
	],
	controllers: [AppController],
	providers: [DockerService, AppStoreService, { provide: ConfigService, useValue: new ConfigService('.env') }],
} )
export class AppModule { }
