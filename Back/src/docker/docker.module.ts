import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { Volume } from 'dockerode';
import { AppController } from './app/app.controller';
import { DockerService } from './docker/docker.service';
import { VolumeService } from './docker/volume/volume.service';
import { VolumeController } from './volume/volume.controller';

@Module( {
  controllers: [AppController, VolumeController],
  imports: [WinstonModule],
  providers: [DockerService, VolumeService, Volume],
} )
export class DockerModule {}
