import { Injectable } from '@nestjs/common';
import { IAppConfig, IAppServiceInterface } from '../app-interface';
import { AppStoreService } from '../app-store/app-store.service';
import { QemuServiceHelper } from './qemu-service-helper';

@Injectable()
export class QemuService implements IAppServiceInterface<QemuServiceHelper, IAppConfig, {}> {
	public constructor( private readonly appStoreService: AppStoreService ) {}

	public async start( appName: string, version?: string ) {
		throw new Error( 'Not implemented yet' );
	}

	public async stop( id: string ) {
		throw new Error( 'Not implemented yet' );
	}

	public async status( id: string ) {
		throw new Error( 'Not implemented yet' );
	}

	public get( id: string ) {
		throw new Error( 'Not implemented yet' );
	}
}
