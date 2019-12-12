import { Module } from '@nestjs/common';
import { DockerService } from '../docker-service/docker.service';
import { VolumeController } from './volume.controller';
import { VolumeService } from './volume.service';

@Module( {
	controllers: [ VolumeController ],
	providers: [ VolumeService, DockerService ],
} )
export class VolumeModule {}
