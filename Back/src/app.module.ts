import { Module } from '@nestjs/common';

import { DockerModule } from './docker/docker.module';
import { GlobalModule } from './global/global.module';
import { VirshModule } from './virsh/virsh.module';

@Module( {
	imports: [
		DockerModule,
		GlobalModule,
		VirshModule,
	],
} )
export class AppModule { }
