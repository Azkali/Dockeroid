import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { VirshController } from './controller/virsh.controller';
import { VirshHypervisorService } from './virsh/virsh.service';

@Module( {
  controllers: [VirshController],
  exports: [VirshHypervisorService],
  imports: [WinstonModule],
  providers: [VirshHypervisorService],
} )
export class VirshModule {}
