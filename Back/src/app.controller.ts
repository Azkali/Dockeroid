import { Controller, Get, Inject, NotFoundException, Param } from '@nestjs/common';
import {fromPairs} from 'lodash';
import { Logger } from 'winston';

import { first, map } from 'rxjs/operators';
import { DockerService } from './services/docker/docker.service';

@Controller( 'docker' )
export class AppController {
	public constructor( @Inject( 'winston' ) private readonly logger: Logger, private readonly dockerService: DockerService ) { }

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
		this.logger.info( `Started app ${appName} v${newContainerHelper.appConfig.version} with id ${newContainerHelper.id}` );
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
		console.log( 'Stopped container with id ' + appId );
		return containerStatus;
	}

	@Get( 'get/:appId' )
	public async getContainer(
		@Param( 'appId' ) appId: string,
	) {
		const dockerHelper = this.dockerService.get( appId );
		if ( !dockerHelper ) {
			throw new NotFoundException();
		}
		return dockerHelper.appConfig;
	}

	@Get( 'list' )
	public async listContainers() {
		return this.dockerService.containers.pipe(
			first(),
			map( containerHelperMap => fromPairs( [...containerHelperMap.entries()]
				.map( ( [, helper] ) => [helper.id, helper.appConfig] ) ) ),
		);
	}
}
