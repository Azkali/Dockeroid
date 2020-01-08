import { Controller, Get, Param } from '@nestjs/common';
import { first } from 'rxjs/operators';
import { AppStoreService } from '../app-store/app-store.service';

@Controller( 'app' )
export class ListController {

	public constructor( private readonly appService: AppStoreService ) { }

	/**
	 * List all available applications from a repository
	 * @returns Observable containing an array with all apps
	 */
	@Get( 'list' )
	public listApps() {
		return this.appService.repoIndex.pipe( first() );
	}
}
