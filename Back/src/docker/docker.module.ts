import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { DockerService } from './docker-service/docker.service';
import { DockerController } from './docker.controller';

@Module( {
  controllers: [DockerController],
  imports: [WinstonModule],
  providers: [DockerService],
} )
export class DockerModule {}
