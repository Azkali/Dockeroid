import { Controller, Get, Param, Response } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';

import { version } from 'punycode';
import { Client, Server } from 'socket.io';
import { DockerService } from './services/docker/docker.service';
import { Container, ContainerCreateOptions } from 'dockerode';
// import { Response } from 'express';

@Controller( 'docker' )
// @WebSocketGateway( 80, { namespace: 'events' } )
export class AppController {
  public constructor( private readonly dockerService: DockerService ) {

  }

  @Get()
  public getHello(): string {
	return 'ok';
  }

  @Get( 'start/:containerName' )
  public async startContainer(
    @Param( 'containerName' ) containerName: string
  ) {
      return this.startContainerWithVersion(containerName);
  }

  @Get( 'start/:containerName/v:version' )
  public async startContainerWithVersion(
	  @Param( 'containerName' ) containerName: string,
	  @Param( 'version' ) version?: string ) {
      console.log({containerName, version})
  const newContainerHelper = await this.dockerService.start( { name: containerName, version } );
  return { appId: newContainerHelper.id };
  }

  // @WebSocketServer()
  // public server!: Server;

  // @SubscribeMessage( 'events' )
  // public handleEvent( client: Client, data: unknown ): WsResponse<unknown> {
	// const event = 'events';
	// return { event, data };
  // }
}
