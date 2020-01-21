import { Test, TestingModule } from '@nestjs/testing';
import { WinstonModule } from 'nest-winston';
import { AppStoreService } from '../../global/app-store/app-store.service';
import { VirshService } from './virsh.service';

describe( 'VirshService', () => {
  let service: VirshService;
  const mockService = {};

  beforeEach( async () => {
	const module: TestingModule = await Test.createTestingModule( {
		imports: [ WinstonModule.forRoot( {} ) ],
		providers: [
			VirshService,
			{
				provide: AppStoreService,
				useValue: mockService,
			},
		],
	} ).compile();

	service = module.get<VirshService>( VirshService );
  } );

  it( 'should be defined', () => {
	expect( service ).toBeDefined();
  } );
} );
