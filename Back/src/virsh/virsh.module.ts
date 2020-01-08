import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { VirshController } from './controller/virsh.controller';
import { Virsh } from './virsh/virsh';
import { VirshService } from './virsh/virsh.service';

@Module( {
  controllers: [VirshController],
  exports: [VirshService, Virsh],
  imports: [WinstonModule],
  providers: [VirshService, Virsh],
} )
export class VirshModule {}
