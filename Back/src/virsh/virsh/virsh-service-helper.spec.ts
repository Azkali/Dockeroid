import { Test, TestingModule } from '@nestjs/testing';
import { VirshServiceHelper } from './virsh-service-helper';

describe( 'VirshServiceHelper', () => {
  let service: VirshServiceHelper;

  beforeEach( async () => {
	const module: TestingModule = await Test.createTestingModule( {
		providers: [VirshServiceHelper],
	} ).compile();

	service = module.get<VirshServiceHelper>( VirshServiceHelper );
  } );

  it( 'should be defined', () => {
	expect( service ).toBeDefined();
  } );
} );
