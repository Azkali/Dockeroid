import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonModule } from 'nest-winston';
import * as request from 'supertest';
import { ContainerService } from '../../docker/container/container.service';
import { VirshService } from '../../virsh/virsh/virsh.service';
import { AppStoreService } from '../app-store/app-store.service';
import { ConfigService } from '../config/config.service';
import { AppsController } from './apps.controller';

describe( 'Apps Controller', () => {
let app: INestApplication;

beforeEach( async () => {
	const module: TestingModule = await Test.createTestingModule( {
		controllers: [AppsController],
		imports: [WinstonModule],
		providers: [
			AppStoreService,
			ContainerService,
			VirshService,
			{
				provide: ConfigService,
				useValue: new ConfigService( '.env' ),
			},
		],
	} )
	.compile();

	app = module.createNestApplication();
	await app.init();
  } );

it( '/GET /apps/stopAll', () =>
		request( app.getHttpServer() )
		.get( '/apps/stopAll' )
		.expect( 200 ) );

afterAll( async () => {
		await app.close();
	} );
} );
