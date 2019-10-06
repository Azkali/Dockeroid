import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { AppController } from './app/app.controller';
import { VolumeController } from './volume/volume.controller';
import { DockerService } from './docker/docker.service';

@Module({
  controllers: [AppController, VolumeController],
  providers: [DockerService],
  imports: [WinstonModule]
})
export class DockerModule {}
