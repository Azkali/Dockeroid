import { Module } from '@nestjs/common';
import { RouterModule, Routes } from 'nest-router';

import { DockerModule } from './docker/docker.module';
import { VolumeModule } from './docker/volume/volume.module';
import { GlobalModule } from './global/global.module';

const routes: Routes = [
	{
		children: [
			{
				module: VolumeModule,
				path: '/:appId/volumes',
			},
		],
		module: DockerModule,
		path: '/docker',
	},
];

@Module( {
	imports: [
		RouterModule.forRoutes( routes ),
		GlobalModule,
		DockerModule,
		VolumeModule,
	],
} )
export class AppModule {}
