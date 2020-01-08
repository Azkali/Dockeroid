import { Test, TestingModule } from '@nestjs/testing';
import { shuffle } from 'lodash';
import { ConfigService } from './config.service';

describe( 'ConfigService', () => {
  let service: ConfigService;

  beforeEach( async () => {
	const module: TestingModule = await Test.createTestingModule( {
		providers: [
			{
				provide: ConfigService,
				useValue: new ConfigService( '.env' ),
			},
		],
	} ).compile();

	service = module.get<ConfigService>( ConfigService );
	jest.clearAllMocks();
  } );

  it( 'should be defined', () => {
	expect( service ).toBeDefined();
  } );
  describe( 'get', () => {
	it.each( shuffle( [
		['foo'],
		['bar'],
		['baz'],
		['qux'],
	] ) )( 'should get key %s', async ( key: string ) => {
		const spy = jest.spyOn( ConfigService.prototype, 'get' ).mockReturnValue( { start: jest.fn() } as any );
		service.get( key );
		expect( spy ).toHaveBeenCalledTimes( 1 );
		expect( spy.mock.calls[0] ).toReturn();
	} );
  } );
} );
