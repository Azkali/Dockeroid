import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DockerService } from './services/docker/docker.service';
import { AppStoreService } from './services/app-store/app-store.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [DockerService, AppStoreService],
})
export class AppModule {}
