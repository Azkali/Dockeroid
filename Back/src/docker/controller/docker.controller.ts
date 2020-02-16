import { Controller, Get, Inject, NotFoundException, Param } from '@nestjs/common';
import { fromPairs } from 'lodash';
import { first, map } from 'rxjs/operators';
import { AHypervisorController } from 'src/global/hypervisor/a-hypervisor.controller';
import { Logger } from 'winston';
import { DockerHypervisorService } from '../container/container.service';

@Controller( 'docker' )
export class DockerController extends AHypervisorController<DockerHypervisorService> {
	public constructor(
		@Inject( 'winston' ) protected readonly logger: Logger,
		private readonly containerService: DockerHypervisorService,
		) { super( logger, containerService ); }

	/**
	 * Starts a container
	 *
	 * @param containerName - name of the container to start
	 *
	 * @returns A promise object containing the id and a Dockerode.Container
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
	 * @returns A promise object containing the id and a Dockerode.Container
	 */
	@Get( 'start/:name/:version?' )
	public async startContainerWithVersion(
		@Param( 'name' ) name: string,
		@Param( 'version' ) version?: string
	) {
		const newContainerHelper = await this.containerService.startWithVersion( name, version );
		await newContainerHelper.container.start();
		this.logger.info( `Started app ${name} v${newContainerHelper.appConfig.version} with id ${newContainerHelper.id}` );
		return { id: newContainerHelper.id, container: newContainerHelper.container };
	}

	/**
	 * Get the status a container
	 *
	 * @param id - id of the container to fetch
	 *
	 * @returns A promise of Dockerode.ContainerStats
	 */
	@Get( 'status/:id' )
	public async statusOfContainer(
		@Param( 'id' ) id: string,
	) {
		const containerStatus = await this.containerService.status( id );
		return containerStatus;
	}
	/**
	 * Stop a running container
	 *
	 * @param id - id of the container to stop
	 *
	 * @returns A promise of void
	 */
	@Get( 'stop/:id' )
	public async stopContainer(
		@Param( 'id' ) id: string,
	) {
		const containerStatus = await this.containerService.stop( id );
		return containerStatus;
	}

	/**
	 * Get a container
	 *
	 * @param id - id of the container to fetch
	 *
	 * @returns A promise of IAppConfig
	 *
	 * @throws NotFoundException
	 */
	@Get( 'get/:id' )
	public async getContainer(
		@Param( 'id' ) id: string,
	) {
		const dockerHelper = this.containerService.get( id );
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
	 * @param id - id of the running container
	 */
	@Get( 'listVolumes/:id' )
	public async listVolumes(
		@Param( 'id' ) id: string,
	) {
		const volumesList = await this.containerService.listVolumes( id );
		return volumesList;
	}
}
