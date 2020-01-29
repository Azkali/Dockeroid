import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonModule } from 'nest-winston';
import * as request from 'supertest';
import { AppStoreService } from '../../global/app-store/app-store.service';
import { ContainerService } from '../container/container.service';
import { DockerController } from './docker.controller';

describe( 'App Controller', () => {
	let app: INestApplication;
	let controller: DockerController;
	const mockService = {};

	beforeEach( async () => {
		const module: TestingModule = await Test.createTestingModule( {
			controllers: [DockerController],
			imports: [WinstonModule.forRoot( {} )],
			providers: [
				ContainerService,
				{
					provide: AppStoreService,
					useValue: mockService,
				},
			],
		} ).compile();

		controller = module.get<DockerController>( DockerController );
		app = module.createNestApplication();
		await app.init();
	} );

	it( 'should be defined', () => {
		expect( controller ).toBeDefined();
	} );

	it( '/GET /docker', () =>
		request( app.getHttpServer() )
			.get( '/docker' )
			.expect( 200 ) );

	afterAll( async () => {
		await app.close();
	} );
} );
