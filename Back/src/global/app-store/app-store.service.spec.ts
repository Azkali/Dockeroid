import { Test, TestingModule } from '@nestjs/testing';
import { AppStoreService } from './app-store.service';

describe('AppStoreService', () => {
  let service: AppStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppStoreService],
    }).compile();

    service = module.get<AppStoreService>(AppStoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
