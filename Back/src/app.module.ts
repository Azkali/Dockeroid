import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DockerService } from './services/docker/docker.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [DockerService],
})
export class AppModule {}
