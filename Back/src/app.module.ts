import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppStoreService } from './services/app-store/app-store.service';
import { ConfigService } from './services/config/config.service';
import { DockerService } from './services/docker/docker.service';

@Module( {
  imports: [],
  controllers: [AppController],
  providers: [DockerService, AppStoreService, { provide: ConfigService, useValue: new ConfigService( `.env` ) }],
} )
export class AppModule {}
