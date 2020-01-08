import { Test, TestingModule } from '@nestjs/testing';
import { VirshService } from './virsh.service';

describe( 'VirshService', () => {
  let service: VirshService;

  beforeEach( async () => {
	const module: TestingModule = await Test.createTestingModule( {
		providers: [VirshService],
	} ).compile();

	service = module.get<VirshService>( VirshService );
  } );

  it( 'should be defined', () => {
	expect( service ).toBeDefined();
  } );
} );
