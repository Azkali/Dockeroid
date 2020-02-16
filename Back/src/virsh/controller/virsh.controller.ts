import { Controller, Get, Inject, NotFoundException, Param } from '@nestjs/common';
import { AHypervisorController } from 'src/global/hypervisor/a-hypervisor.controller';
import { Logger } from 'winston';
import { VirshHypervisorService } from '../virsh/virsh.service';

@Controller( 'virsh' )
export class VirshController extends AHypervisorController<VirshHypervisorService> {
	public constructor(
		@Inject( 'winston' ) protected readonly logger: Logger,
		private readonly virshService: VirshHypervisorService,
	) { super( logger, virshService ); }

	/**
	 * Starts a
	 *
	 * @param name - name of the  to start
	 *
	 * @returns A promise object containing the id and a Virsh.
	 */
	@Get( 'start/:name' )
	public async start(
		@Param( 'name' ) name: string,
	) {
		return this.startWithVersion( name );
	}

	/**
	 * Starts a  with specified version
	 *
	 * @param name - name of the  to start
	 *
	 * @param version - version of the  to start
	 *
	 * @returns A promise object containing the id and a Virsh.
	 */
	@Get( 'start/:name/:version?' )
	public async startWithVersion(
		@Param( 'name' ) name: string,
		@Param( 'version' ) version?: string ) {
		const newHelper = await this.virshService.startWithVersion( name, version );
		this.logger.info( `Started app ${name} v${newHelper.appConfig.version} with id ${newHelper.id}` );
		return { id: newHelper.id, config: newHelper.appConfig };
	}

	/**
	 * Get the status a
	 *
	 * @param id - id of the  to fetch
	 *
	 * @returns A promise of Virsh.Stats
	 */
	@Get( 'status/:id' )
	public async statusOf(
		@Param( 'id' ) id: string,
	) {
		const Status = await this.virshService.status( id );
		return Status;
	}
	/**
	 * Stop a running
	 *
	 * @param id - id of the  to stop
	 *
	 * @returns A promise of void
	 */
	@Get( 'stop/:id' )
	public async stop(
		@Param( 'id' ) id: string,
	) {
		const Status = await this.virshService.stop( id );
		return Status;
	}

	/**
	 * Get a
	 *
	 * @param id - id of the  to fetch
	 *
	 * @returns A promise of IAppConfig
	 *
	 * @throws NotFoundException
	 */
	@Get( 'get/:id' )
	public async get(
		@Param( 'id' ) id: string,
	) {
		const virshHelper = this.virshService.get( id );
		if ( !virshHelper ) {
			throw new NotFoundException();
		}
		return virshHelper.appConfig;
	}

	/**
	 * Lists all available
	 *
	 * @returns A dictionnary of IAppConfig
	 */
	@Get( 'list' )
	public async listMachines() {
		const listHelper = await this.virshService.list();
		return Object.entries( listHelper )
			.map( ( [, helper] ) => [helper.id, helper.appConfig] );
	}
}
