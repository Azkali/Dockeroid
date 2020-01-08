import { Controller, Get, Inject, Param } from '@nestjs/common';
import { Dictionary } from 'lodash';
import { Logger } from 'winston';
import { ContainerService } from '../../docker/container/container.service';
import { IAppServiceInterface } from '../../services/app-interface';
import { VirshService } from '../../virsh/virsh/virsh.service';

@Controller( 'apps' )
export class AppsController {
	private readonly services: Dictionary<IAppServiceInterface<any, any, any>>;

	public constructor(
		@Inject( 'winston' ) private readonly logger: Logger,
		docker: ContainerService,
		virsh: VirshService,
		) {
		this.services = {
			docker,
			virsh,
		};
	}

	/**
	 * Stop a running application
	 * @param id - Id of a running App
	 */
	@Get( 'stop/:id' )
	public async stop(
		@Param( 'id' ) id: string,
	) {
		const [serviceName, service] = Object.entries( this.services ).find( ( [name, relatedService] ) =>
		id.startsWith( name + '-' ) ) || [];
		if ( !service ) {
			throw new Error();
		}
		await service.stop( id );
	}
	/* TODO: Implement stopAll()  */
	/**
	 * Stop all running applications
	 */
	@Get( 'stopAll' )
	public stopAll() {
		Object.entries( this.services ).forEach( ( [id, service] ) => {
			service.list().then(
				res => this.logger.log( { message: `${res}`, level: 'info' } ),
				rej => { throw new Error( `${rej}` ); } ,
			);
		} );
	}

	/**
	 * Gather informations about an application
	 * @param appName - Application name defined in the repository file
	 */
	@Get( 'infos/:appName' )
	public infos(
		@Param( 'appName' ) appName: string,
	) {
		return this.infosWithVersion( appName );
	}

	/**
	 * Gather informations about an application
	 * @param appName - Application name defined in the repository file
	 * @param version - Version of the application
	 */
	@Get( 'infos/:appName/:version' )
	public infosWithVersion(
		@Param( 'appName' ) appName: string,
		@Param( 'version' ) version?: string,
	) {
		throw new Error( 'Not implemented yet' );
	}

	/**
	 * Start an application
	 * @param appName - Application name defined in the repository file
	 */
	@Get( 'start/:appName' )
	public startApp(
		@Param( 'appName' ) appName: string,
	) {
		return this.startAppWithVersion;
	}

	/**
	 * Start an application with version
	 * @param appName - Application name defined in the repository file
	 * @param version - Version of the application
	 */
	@Get( 'start/:appName/:version' )
	public startAppWithVersion(
		@Param( 'appName' ) appName: string,
		@Param( 'version' ) version: string,
	) {
		return `${appName}:${version}`;
	}
}
