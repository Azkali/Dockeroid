import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { AppController } from '../docker/app/app.controller';
import { QemuService } from './qemu/qemu.service';

@Module( {
  controllers: [AppController],
  imports: [WinstonModule],
  providers: [QemuService],
} )
export class QemuModule {}
