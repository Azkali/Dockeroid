import { Controller, Get, Inject, NotFoundException, Param } from '@nestjs/common';
import { fromPairs } from 'lodash';
import { Logger } from 'winston';

import { first, map } from 'rxjs/operators';
import { ContainerService } from '../container/container.service';

@Controller( 'docker' )
export class DockerController {
	public constructor(
		@Inject( 'winston' ) private readonly logger: Logger,
		private readonly containerService: ContainerService,
		) { }

	/**
	 * Simple Hello World confirming app is running
	 * @return A string printing out Hello World
	 */
	@Get()
	public getHello(): string {
		return 'Wello Horld';
	}

	/**
	 * Starts a container
	 *
	 * @param containerName - name of the container to start
	 *
	 * @returns A promise object containing the appId and a Dockerode.Container
	 */
	@Get( 'start/:containerName' )
	public async startContainer(
		@Param( 'containerName' ) containerName: string,
	) {
		return this.startContainerWithVersion( containerName );
	}

	/**
	 * Starts a container with specified version
	 *
	 * @param containerName - name of the container to start
	 *
	 * @param version - version of the container to start
	 *
	 * @returns A promise object containing the appId and a Dockerode.Container
	 */
	@Get( 'start/:appName/:version?' )
	public async startContainerWithVersion(
		@Param( 'appName' ) appName: string,
		@Param( 'version' ) version?: string ) {
		const newContainerHelper = await this.containerService.start( appName, version );
		await newContainerHelper.container.start();
		this.logger.info( `Started app ${appName} v${newContainerHelper.appConfig.version} with id ${newContainerHelper.id}` );
		return { appId: newContainerHelper.id, container: newContainerHelper.container };
	}

	/**
	 * Get the status a container
	 *
	 * @param appId - appId of the container to fetch
	 *
	 * @returns A promise of Dockerode.ContainerStats
	 */
	@Get( 'status/:appId' )
	public async statusOfContainer(
		@Param( 'appId' ) appId: string,
	) {
		const containerStatus = await this.containerService.status( appId );
		return containerStatus;
	}
	/**
	 * Stop a running container
	 *
	 * @param appId - appId of the container to stop
	 *
	 * @returns A promise of void
	 */
	@Get( 'stop/:appId' )
	public async stopContainer(
		@Param( 'appId' ) appId: string,
	) {
		const containerStatus = await this.containerService.stop( appId );
		return containerStatus;
	}

	/**
	 * Get a container
	 *
	 * @param appId - appId of the container to fetch
	 *
	 * @returns A promise of IAppConfig
	 *
	 * @throws NotFoundException
	 */
	@Get( 'get/:appId' )
	public async getContainer(
		@Param( 'appId' ) appId: string,
	) {
		const dockerHelper = this.containerService.get( appId );
		if ( !dockerHelper ) {
			throw new NotFoundException();
		}
		return dockerHelper.appConfig;
	}

	/**
	 * Lists all available container
	 *
	 * @returns A dictionnary of IAppConfig
	 */
	@Get( 'list' )
	public async listContainers() {
		return this.containerService.containers.pipe(
			first(),
			map( containerHelperMap => fromPairs( [...containerHelperMap.entries()]
				.map( ( [, helper] ) => [helper.id, helper.appConfig] ) ) ),
		);
	}
	// WIP
	/**
	 * List avalaible volumes for a container
	 * @param appId - appId of the running container
	 */
	@Get( 'listVolumes/:appId' )
	public async listVolumes(
		@Param( 'appId' ) appId: string,
	) {
		const volumesList = await this.containerService.listVolumes( appId );
		return volumesList;
	}
}
