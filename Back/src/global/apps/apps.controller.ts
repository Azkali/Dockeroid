import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { Dictionary } from 'lodash';
import { first } from 'rxjs/operators';
import { AppStoreService } from '../app-store/app-store.service';

@Controller( 'apps' )
export class AppsController {

	public constructor(
		@Inject( 'winston' ) private readonly logger: Logger,
		private readonly appService: AppStoreService,
		) {	}

	/**
	 * List all available applications from a repository
	 * @returns Observable containing an array with all apps
	 */
	@Get( 'list' )
	public listApps() {
		return this.appService.repoIndex.pipe( first() );
	}

	/* TODO: Implement stopAll()  */
	/**
	 * Stop all running applications
	 */
	// @Get( 'stopAll' )
	// public async stopAll() {
	// 	const apps = await this.hypervisor.stop();
	// 	apps.forEach( ( [id, service] ) => {
	// 		service.list().then(
	// 			res => this.logger.log( { message: `${res}`, level: 'info' } ),
	// 			rej => { throw new Error( `${rej}` ); } ,
	// 		);
	// 	} );
	// }
}
