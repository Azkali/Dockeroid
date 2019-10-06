import { Test, TestingModule } from '@nestjs/testing';
import { VolumeController } from './volume.controller';

describe('Volume Controller', () => {
  let controller: VolumeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VolumeController],
    }).compile();

    controller = module.get<VolumeController>(VolumeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
