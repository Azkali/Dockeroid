import { Get, Inject, NotFoundException, Param } from '@nestjs/common';
import { Logger } from 'winston';
import { IHypervisorService } from '../../services/i-hypervisor-service';

export abstract class AHypervisorController<THypervisorService extends IHypervisorService<any, any, any>> {

	public constructor(
		@Inject( 'winston' ) protected readonly logger: Logger,
		private readonly hypervisorService: THypervisorService,
		) {	}

	/**
	 * Stop a running application
	 * @param id - Id of a running App
	 */
	@Get( 'stop/:id' )
	public async stop(
		@Param( 'id' ) id: string,
	) {
		await this.hypervisorService.stop( id );
	}

	/**
	 * Gather informations about an application
	 * @param name - Application name defined in the repository file
	 */
	@Get( 'infos/:name' )
	public infos(
		@Param( 'name' ) name: string,
	) {
		return this.infosWithVersion( name );
	}

	/**
	 * Gather informations about an application
	 * @param name - Application name defined in the repository file
	 * @param version - Version of the application
	 */
	@Get( 'infos/:name/:version' )
	public infosWithVersion(
		@Param( 'name' ) name: string,
		@Param( 'version' ) version?: string,
	) {
		return this.hypervisorService.infosWithVersion( name, version );
	}

	/**
	 * Start an application
	 * @param name - Application name defined in the repository file
	 */
	@Get( 'start/:name' )
	public start(
		@Param( 'name' ) name: string,
	) {
		return this.startWithVersion( name );
	}

	/**
	 * Start an application with version
	 * @param name - Application name defined in the repository file
	 * @param version - Version of the application
	 */
	@Get( 'start/:name/:version?' )
	public startWithVersion(
		@Param( 'name' ) name: string,
		@Param( 'version' ) version?: string,
	) {
		return this.hypervisorService.startWithVersion( name, version );
	}

	/**
	 * Retrieve status of a container
	 * @param id - id of the app to fetch status
	 * @returns The status of the app
	 */

	@Get( 'status/:id' )
	public status(
		@Param( 'id' ) id: string,
	) {
		return this.hypervisorService.status( id ) ;
	}
	/**
	 * Retrieve a container configuration
	 * @param id - Id of the app to get
	 * @throws NotFoundException
	 * @returns App configuration
	 */
	@Get( 'get/:id' )
	public get(
		@Param( 'id' ) id: string,
	) {
		const app = this.hypervisorService.get( id );
		if ( !app ) {
			throw new NotFoundException();
		}
		return app.appConfig;
	}

	/**
	 * Retrieve mounted volume for an app
	 * @param id - Id of the app to retrieve mounted volumes from
	 * @throws NotFoundException
	 * @returns A list of the volumes mounted
	 */
	@Get( 'volumes/:id' )
	public listVolumes(
		@Param( 'id' ) id: string,
	) {
		return this.hypervisorService.listVolumes( id );
	}
}
