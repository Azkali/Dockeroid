import { Test, TestingModule } from '@nestjs/testing';
import { shuffle } from 'lodash';
import { ConfigService } from '../config/config.service';
import { AppStoreService } from './app-store.service';

describe( 'AppStoreService', () => {
	let service: AppStoreService;
	let config: ConfigService;

 beforeEach( async () => {
	const module: TestingModule = await Test.createTestingModule( {
		providers: [ AppStoreService, {
			provide: ConfigService,
			useValue: {
			  get: jest.fn(),
			},
		} ],
	} ).compile();

	service = module.get<AppStoreService>( AppStoreService );
	config = module.get<ConfigService>( ConfigService );
	jest.clearAllMocks();
  } );

 it( 'should be defined', () => {
	expect( service ).toBeDefined();
  } );

 describe( 'getApp', () => {
	it.each( shuffle( [
		['foo', '0.0.1', 'foo'],
		['bar', '0.0.2', 'bar'],
		['baz', '0.0.3', 'baz'],
		['qux', '6.6.6', 'qux'],
	] ) )( 'should get image %s for image name %s and version %s', async ( container: string, version: string, image: string ) => {
		const spy = jest.spyOn( AppStoreService.prototype, 'getApp' ).mockReturnValue( { start: jest.fn() } as any );
		service.getApp( container, version );
		expect( spy ).toHaveBeenCalledTimes( 1 );
		expect( spy.mock.calls[0][0] ).toEqual( image );
	} );
  } );
} );
