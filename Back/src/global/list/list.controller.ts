import { Controller, Get, Param } from '@nestjs/common';
import { first } from 'rxjs/operators';
import { AAppService } from 'src/services/a-app-service';
import { version } from 'winston';
import { AppStoreService } from '../app-store/app-store.service';
import { IApp, IAppVersion } from 'src/mocks/app-store';

@Controller( 'app' )
export class ListController {

	public constructor( private readonly appService: AppStoreService ) { }

	@Get( 'list' )
	public listApps() {
		return this.appService.repoIndex.pipe( first() );
	}
}
