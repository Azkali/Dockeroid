import { Test, TestingModule } from '@nestjs/testing';
import * as Docker from 'dockerode';
import { shuffle } from 'lodash';
import { DockerService } from './docker.service';

describe( 'DockerService', () => {
	let service: DockerService;
	
	beforeEach( async () => {
		const module: TestingModule = await Test.createTestingModule( {
			providers: [DockerService],
		} ).compile();
		
		service = module.get<DockerService>( DockerService );
		jest.clearAllMocks();
	} );
	
	it( 'should be defined', () => {
		expect( service ).toBeDefined();
	} );
	describe( 'startContainer', () => {
		it( 'should call the `command` method', () => {
			jest.spyOn( Docker.prototype, 'createContainer' ).mockReturnValue( Promise.resolve( {} ) );
			service.start();
			expect( Docker.prototype.createContainer ).toHaveBeenCalledTimes( 1 );
		} );
		it( 'should wait for the command end', () => {
			const promiseMock = { then() { return promiseMock; }, catch() { return promiseMock; }, finally() { return promiseMock; } };
			jest.spyOn( Docker.prototype, 'createContainer' ).mockReturnValue( promiseMock as any );
			const promise = service.start();
			expect( promise ).toBe( promiseMock );
		} );
		it.each( shuffle( [
			['foo', '0.0.1', 'foo:0.0.1'],
			['bar', '0.0.2', 'bar:0.0.2'],
			['baz', '0.0.3', 'baz:0.0.3'],
			['qux', '6.6.6', 'qux:6.6.6'],
		] ) )( 'should get image %s for image name %s and version %s', async ( container: string, version: string, image: string ) => {
			const spy = jest.spyOn( Docker.prototype, 'createContainer' ).mockReturnValue( Promise.resolve( { start: jest.fn() } as any ) );
			await service.start( { container, version } );
			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( spy.mock.calls[0][0] ).toEqual( {
				Image: image,
			} );
		} );
	} );
} );
