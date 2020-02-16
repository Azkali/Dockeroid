import { Test, TestingModule } from '@nestjs/testing';
import { WinstonModule } from 'nest-winston';
import { AppStoreService } from '../../global/app-store/app-store.service';
import { Virsh } from './virsh';
import { VirshHypervisorService } from './virsh.service';

describe( 'VirshService', () => {
  let service: VirshHypervisorService;
  const mockService = {};

  beforeEach( async () => {
	const module: TestingModule = await Test.createTestingModule( {
		imports: [ WinstonModule.forRoot( {} ) ],
		providers: [
			Virsh,
			VirshHypervisorService,
			{
				provide: AppStoreService,
				useValue: mockService,
			},
		],
	} ).compile();

	service = module.get<VirshHypervisorService>( VirshHypervisorService );
  } );

  it( 'should be defined', () => {
	expect( service ).toBeDefined();
  } );
} );
