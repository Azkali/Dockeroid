import { Module, Global } from '@nestjs/common';
import winston = require('winston');
import { WinstonModule } from 'nest-winston';
import { resolve } from 'path';

import { AppStoreService } from './app-store/app-store.service';
import { ConfigService } from './config/config.service';

@Global()
@Module({
	exports: [
		WinstonModule,
		AppStoreService
	],
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
	providers: [
		AppStoreService,
		{ provide: ConfigService, useValue: new ConfigService('.env') },
	]
})
export class GlobalModule {}
