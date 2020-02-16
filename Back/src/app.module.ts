import { Module } from '@nestjs/common';

import { DockerModule } from './docker/docker.module';
import { AppsController } from './global/apps/apps.controller';
import { GlobalModule } from './global/global.module';
import { VirshModule } from './virsh/virsh.module';

@Module( {
	controllers: [AppsController],
	imports: [
		DockerModule,
		GlobalModule,
		VirshModule,
	],
} )
export class AppModule { }
