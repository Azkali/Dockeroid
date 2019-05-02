import { Test, TestingModule } from '@nestjs/testing';
import * as Docker from 'dockerode';
import { DockerServiceHelper } from './docker-service-helper';

describe( 'DockerServiceHelper', () => {
  let service: DockerServiceHelper;

  beforeEach( async () => {
	const module: TestingModule = await Test.createTestingModule( {
		providers: [DockerServiceHelper],
	} ).compile();

	service = module.get<DockerServiceHelper>( DockerServiceHelper );
	jest.clearAllMocks();
  } );

  it( 'should be defined', () => {
	expect( service ).toBeDefined();
  } );

  describe( 'Stats of Container', () => {
	it( 'should call the `command` method', () => {
		jest.spyOn( Docker.Container.prototype, 'stats' ).mockReturnValue( Promise.resolve( {} ) );
		service.status();
		expect( Docker.Container.prototype.stats ).toHaveBeenCalledTimes( 1 );
	} );
	it( 'should wait for the command end', () => {
		const promiseMock = { then() { return promiseMock; }, catch() { return promiseMock; }, finally() { return promiseMock; } };
		jest.spyOn( Docker.Container.prototype, 'stats' ).mockReturnValue( promiseMock as any );
		const promise = service.status();
		expect( promise ).toBe( promiseMock );
	} );
	async () => {
		const spy = jest.spyOn( Docker.Container.prototype, 'stats' ).mockReturnValue( Promise.resolve( { status: jest.fn() } as any ) );
		await service.status( );
		expect( spy ).toHaveBeenCalledTimes( 1 );
	};
  } );

} );