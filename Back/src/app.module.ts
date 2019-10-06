import { Module } from '@nestjs/common';

import { DockerModule } from './docker/docker.module';
import { GlobalModule } from './global/global.module';

@Module( {
	imports: [
		DockerModule,
		GlobalModule,
	],
} )
export class AppModule { }
