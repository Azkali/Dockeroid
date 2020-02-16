import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { VirshController } from '../src/virsh/controller/virsh.controller';

describe( 'AppController (e2e)', () => {
  let app: INestApplication;
  let controller: VirshController;

  beforeEach( async () => {
	const moduleFixture: TestingModule = await Test.createTestingModule( {
		imports: [AppModule],
	} ).compile();

	app = moduleFixture.createNestApplication();
	await app.init();
  } );

  it( '/ (GET)', () =>
	request( app.getHttpServer() )
		.get( '/virsh/list' )
		.expect( 200 ) );
} );
