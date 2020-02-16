import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonModule } from 'nest-winston';
import * as request from 'supertest';
import { DockerHypervisorService } from '../../docker/container/container.service';
import { VirshHypervisorService } from '../../virsh/virsh/virsh.service';
import { AppStoreService } from '../app-store/app-store.service';

describe( 'Apps Controller', () => {
let app: INestApplication;
const mockService = {};

beforeEach( async () => {
	const module: TestingModule = await Test.createTestingModule( {
		imports: [WinstonModule.forRoot( {} )],
		providers: [
			DockerHypervisorService,
			VirshHypervisorService,
			{
				provide: AppStoreService,
				useValue: mockService,
			},
		],
	} )
	.compile();

	app = module.createNestApplication();
	await app.init();
  } );
} );
