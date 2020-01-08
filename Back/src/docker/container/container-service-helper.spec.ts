import { Test, TestingModule } from '@nestjs/testing';
import * as Docker from 'dockerode';
import { ContainerServiceHelper } from './container-service-helper';

describe( 'DockerServiceHelper', () => {
	let service: ContainerServiceHelper;

	beforeEach( async () => {
		const module: TestingModule = await Test.createTestingModule( {
			providers: [ContainerServiceHelper],
		} ).compile();

		service = module.get<ContainerServiceHelper>( ContainerServiceHelper );
		jest.clearAllMocks();
	} );

	it( 'should be defined', () => {
		expect( service ).toBeDefined();
	} );

	describe( 'Stats of Container', () => {
		it( 'should call the `command` method', () => {
			jest.spyOn( Docker.Container.prototype, 'stats' ).mockReturnValue( Promise.resolve( {} ) );
			service.status()
			.then( out => out )
			.catch( err => err );
			expect( Docker.Container.prototype.stats ).toHaveBeenCalledTimes( 1 );
		} );
		it( 'should wait for the command end', () => {
			const promiseMock = { then() { return promiseMock; }, catch() { return promiseMock; }, finally() { return promiseMock; } };
			jest.spyOn( Docker.Container.prototype, 'stats' ).mockReturnValue( promiseMock as any );
			const promise = service.status();
			expect( promise ).toBe( promiseMock )
			.then( out => out )
			.catch( err => err );
		} );
		return async () => {
			const spy = jest.spyOn( Docker.Container.prototype, 'stats' ).mockReturnValue( Promise.resolve( { status: jest.fn() } as any ) );
			await service.status( );
			expect( spy ).toHaveBeenCalledTimes( 1 );
		};
	} );

} );
