import { Controller, Get } from '@nestjs/common';
import { AAppService } from 'src/services/a-app-service';
import { AppStoreService } from '../app-store/app-store.service';
import { first } from 'rxjs/operators';

@Controller( 'app' )
export class ListController {

	public constructor( private readonly appService: AppStoreService ) { }

	@Get( 'list' )
	public listApps() {
		return this.appService.repoIndex.pipe(first());
	}
}
