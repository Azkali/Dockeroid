import { Controller, Get, Param } from '@nestjs/common';
import { SubscribeMessage,
		WebSocketGateway,
		WebSocketServer,
		WsResponse  } from '@nestjs/websockets';
import { AppService } from './app.service';

import { version } from 'punycode';
import { Client, Server } from 'socket.io';
import { DockerService } from './services/docker/docker.service';

@Controller( 'docker' )
@WebSocketGateway( 80, { namespace: 'events' } )
export class AppController {
  public constructor( private readonly appService: AppService, private readonly dockerService: DockerService ) {

  }

  @Get()
  public getHello(): string {
	return this.appService.getHello();
  }

  @Get( ':container/' )
  public testDocker( @Param( 'container' ) container: string ) {
	this.dockerService.start( container );
  }

  @WebSocketServer()
  public server: Server;

  @SubscribeMessage( 'events' )
  public handleEvent( client: Client, data: unknown ): WsResponse<unknown> {
	const event = 'events';
	return { event, data };
  }
}
