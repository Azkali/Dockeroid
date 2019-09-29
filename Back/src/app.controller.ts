import { Controller, Get, Param } from '@nestjs/common';

import { DockerService } from './services/docker/docker.service';

@Controller( 'docker' )
export class AppController {
	public constructor( private readonly dockerService: DockerService ) { }

	@Get()
	public getHello(): string {
		return 'Wello Horld';
	}

	@Get( 'start/:containerName' )
	public async startContainer(
		@Param( 'containerName' ) containerName: string,
	) {
		return this.startContainerWithVersion( containerName );
	}

	@Get( 'start/:appName/:version?' )
	public async startContainerWithVersion(
		@Param( 'appName' ) appName: string,
		@Param( 'version' ) version?: string ) {
		const newContainerHelper = await this.dockerService.start( appName, version );
		await newContainerHelper.container.start();
		return { appId: newContainerHelper.id, container: newContainerHelper.container };
	}

	@Get( 'status/:appId' )
	public async statusOfContainer(
		@Param( 'appId' ) appId: string,
	) {
		const containerStatus = await this.dockerService.status( appId );
		return containerStatus;
	}

	@Get( 'stop/:appId' )
	public async stopContainer(
		@Param( 'appId' ) appId: string,
	) {
		const containerStatus = await this.dockerService.stop( appId );
		console.log( 'Stopped conainer with id ' + appId );
		return containerStatus;
	}

	@Get( 'get/:appId' )
	public async getContainer(
		@Param( 'appId' ) appId: string,
	) {
		const containerStatus = this.dockerService.get( appId );
		return containerStatus;
	}

	@Get( 'list' )
	public async listContainers() {
		const containers = await this.dockerService.listContainers();
		return containers;
	}

	@Get( 'pull/:tag' )
	public async pullImage(
		@Param( 'tag' ) tag: string,
	) {
		const pullHelper = await this.dockerService.pullImage( tag );
		return pullHelper;
	}
}
