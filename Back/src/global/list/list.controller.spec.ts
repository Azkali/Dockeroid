import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppStoreService } from '../app-store/app-store.service';
import { ConfigService } from '../config/config.service';
import { ListController } from './list.controller';

describe( 'List Controller', () => {
let app: INestApplication;

beforeEach( async () => {
	const module: TestingModule = await Test.createTestingModule( {
		controllers: [ListController],
		providers: [
			AppStoreService,
			{
				provide: ConfigService,
				useValue: new AppStoreService( new ConfigService( '.env' ) ),
			},
		],
	} )
	.compile();

	app = module.createNestApplication();
	await app.init();
  } );

it( '/GET /app/list', () =>
		request( app.getHttpServer() )
		.get( '/app/list' )
		.expect( 200 ) );

afterAll( async () => {
		await app.close();
	} );
} );
