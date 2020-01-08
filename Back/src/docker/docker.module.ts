import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { ContainerService } from './container/container.service';
import { DockerController } from './controller/docker.controller';
import { VolumeController } from './volume/volume.controller';

@Module( {
  controllers: [DockerController, VolumeController],
  exports: [ContainerService],
  imports: [WinstonModule],
  providers: [ContainerService],
} )
export class DockerModule {}
