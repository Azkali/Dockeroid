import { Controller, Get, Inject, NotFoundException, Param } from '@nestjs/common';
import { Dictionary } from 'lodash';
import { Logger } from 'winston';
import { VirshServiceHelper } from '../virsh/virsh-service-helper';
import { VirshService } from '../virsh/virsh.service';

@Controller( 'virsh' )
export class VirshController {
	public constructor(
		@Inject( 'winston' ) private readonly logger: Logger,
		private readonly virshService: VirshService,
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
	 * Starts a virtualMachine
	 *
	 * @param virtualMachineName - name of the virtualMachine to start
	 *
	 * @returns A promise object containing the appId and a Dockerode.Container
	 */
	@Get( 'start/:virtualMachineName' )
	public async startContainer(
		@Param( 'virtualMachineName' ) virtualMachineName: string,
	) {
		return this.startContainerWithVersion( virtualMachineName );
	}

	/**
	 * Starts a virtualMachine with specified version
	 *
	 * @param virtualMachineName - name of the virtualMachine to start
	 *
	 * @param version - version of the virtualMachine to start
	 *
	 * @returns A promise object containing the appId and a Dockerode.Container
	 */
	@Get( 'start/:appName/:version?' )
	public async startContainerWithVersion(
		@Param( 'appName' ) appName: string,
		@Param( 'version' ) version?: string ) {
		const newContainerHelper = await this.virshService.start( appName, version );
		this.logger.info( `Started app ${appName} v${newContainerHelper.appConfig.version} with id ${newContainerHelper.id}` );
		return { appId: newContainerHelper.id, virtualMachine: newContainerHelper.virsh };
	}

	/**
	 * Get the status a virtualMachine
	 *
	 * @param appId - appId of the virtualMachine to fetch
	 *
	 * @returns A promise of Dockerode.ContainerStats
	 */
	@Get( 'status/:appId' )
	public async statusOfContainer(
		@Param( 'appId' ) appId: string,
	) {
		const virtualMachineStatus = await this.virshService.status( appId );
		return virtualMachineStatus;
	}
	/**
	 * Stop a running virtualMachine
	 *
	 * @param appId - appId of the virtualMachine to stop
	 *
	 * @returns A promise of void
	 */
	@Get( 'stop/:appId' )
	public async stopContainer(
		@Param( 'appId' ) appId: string,
	) {
		const virtualMachineStatus = await this.virshService.stop( appId );
		return virtualMachineStatus;
	}

	/**
	 * Get a virtualMachine
	 *
	 * @param appId - appId of the virtualMachine to fetch
	 *
	 * @returns A promise of IAppConfig
	 *
	 * @throws NotFoundException
	 */
	@Get( 'get/:appId' )
	public async getContainer(
		@Param( 'appId' ) appId: string,
	) {
		const dockerHelper = this.virshService.get( appId );
		if ( !dockerHelper ) {
			throw new NotFoundException();
		}
		return dockerHelper.appConfig;
	}

	/**
	 * Lists all available virtualMachine
	 *
	 * @returns A dictionnary of IAppConfig
	 */
	@Get( 'list' )
	public async listContainers(): Promise<{[key: number]: VirshServiceHelper}> {
		const listHelper: Promise<Dictionary<VirshServiceHelper>> = await this.virshService
		.list()
		.then( out => out )
		.catch( err => err );
		console.log( listHelper );
		return listHelper;
	}
}
