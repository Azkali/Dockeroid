import { Controller, Get, Param } from '@nestjs/common';
import { Dictionary } from 'lodash';
import { first, mergeMap } from 'rxjs/operators';
import { DockerService } from 'src/docker/docker/docker.service';
import { QemuService } from 'src/qemu/qemu/qemu.service';
import { IAppServiceInterface } from 'src/services/app-interface';
import { AppStoreService } from '../app-store/app-store.service';

@Controller( 'apps' )
export class AppsController {
	private readonly services: Dictionary<IAppServiceInterface<any, any, any>>;

	public constructor(
		private readonly appService: IAppServiceInterface<any, any, any>,
		docker: DockerService,
		qemu: QemuService ) {
		this.services = {
			docker,
			qemu,
		};
	}

	@Get( 'stop/:id' )
	public async stop(
		@Param( 'id' ) id: string,
	) {
		const [serviceName, service] = Object.entries( this.services ).find( ( [name, service] ) =>
		id.startsWith( name + '-' ) ) || [];
		if ( !service ) {
			throw new Error();
		}
		await service.stop( id );
	}
	/* TODO: Implement stopAll()  */
	@Get( 'stopAll' )
	public stopAll() {
		Object.entries( this.services ).forEach( ( [id, service] ) => {
			service.list().then(
				res => res,
				rej => { throw new Error( rej ); } ,
			);
		} );
	}

	@Get( 'infos/:appName' )
	public infos(
		@Param( 'appName' ) appName: string,
	) {
		return this.infosWithVersion( appName );
	}

	@Get( 'infos/:appName/:version' )
	public infosWithVersion(
		@Param( 'appName' ) appName: string,
		@Param( 'version' ) version?: string,
	) {

	}

	@Get( 'start/:appName' )
	public startApp(
		@Param( 'appName' ) appName: string,
	) {
		return this.startAppWithVersion;
	}

	@Get( 'start/:appName/:version' )
	public startAppWithVersion(
		@Param( 'appName' ) appName: string,
		@Param( 'version' ) version: string,
	) {

	}
}
