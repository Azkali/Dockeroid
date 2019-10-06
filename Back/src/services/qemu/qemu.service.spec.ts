import { Test, TestingModule } from '@nestjs/testing';
import { QemuService } from './qemu.service';

describe('QemuService', () => {
  let service: QemuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QemuService],
    }).compile();

    service = module.get<QemuService>(QemuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
