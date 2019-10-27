import { Test, TestingModule } from '@nestjs/testing';
import { VolumeService } from './volume.service';

describe('VolumeService', () => {
  let service: VolumeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VolumeService],
    }).compile();

    service = module.get<VolumeService>(VolumeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
