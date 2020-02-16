import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { DockerHypervisorService } from './container/container.service';
import { DockerController } from './controller/docker.controller';
import { VolumeController } from './volume/volume.controller';

@Module( {
  controllers: [DockerController, VolumeController],
  exports: [DockerHypervisorService],
  imports: [WinstonModule],
  providers: [DockerHypervisorService],
} )
export class DockerModule {}
