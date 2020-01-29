import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonModule } from 'nest-winston';
import * as request from 'supertest';
import { AppStoreService } from '../../global/app-store/app-store.service';
import { Virsh } from '../virsh/virsh';
import { VirshService } from '../virsh/virsh.service';
import { VirshController } from './virsh.controller';

describe( 'Virsh Controller', () => {
	let controller: VirshController;
	let app: INestApplication;
	const mockService = {};

	beforeEach( async () => {
		const module: TestingModule = await Test.createTestingModule( {
			controllers: [VirshController],
			imports: [WinstonModule.forRoot( {} )],
			providers: [
				Virsh,
				VirshService,
				{
					provide: AppStoreService,
					useValue: mockService,
				},
			],
		} ).compile();

		controller = module.get<VirshController>( VirshController );
		app = module.createNestApplication();
		await app.init();
	} );

	it( 'should be defined', () => {
		expect( controller ).toBeDefined();
	} );

	it( '/GET /virsh', () =>
		request( app.getHttpServer() )
			.get( '/virsh' )
			.expect( 200 ) );

	afterAll( async () => {
		await app.close();
	} );
} );
