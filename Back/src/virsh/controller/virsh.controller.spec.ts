import { Test, TestingModule } from '@nestjs/testing';
import { VirshController } from './virsh.controller';

describe( 'Virsh Controller', () => {
  let controller: VirshController;

  beforeEach( async () => {
	const module: TestingModule = await Test.createTestingModule( {
		controllers: [VirshController],
	} ).compile();

	controller = module.get<VirshController>( VirshController );
  } );

  it( 'should be defined', () => {
	expect( controller ).toBeDefined();
  } );
} );
