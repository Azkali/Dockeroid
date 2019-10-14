import { Catch, Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { AppStoreService, IAppWithParams } from '../../global/app-store/app-store.service';
import { AAppService } from '../../services/a-app-service';
import { IAppConfig, IAppServiceInterface } from '../../services/app-interface';
import { IVirtualMachineStats, Qemu, IVirtualMachineCreateOptions } from './qemu';
import { QemuServiceHelper } from './qemu-service-helper';

@Injectable()
export class QemuService extends AAppService implements IAppServiceInterface<QemuServiceHelper, IAppConfig, IVirtualMachineStats> {
	// TODO: Implement Qemu class with status, start, stop, create funcs
	private readonly qemu = new Qemu();
	public constructor( private readonly appStoreService: AppStoreService ) {
		super( 'qemu' );
	}

	private castAppParamsToContainerConfig( config: IAppWithParams<any>, helperId: string ): IVirtualMachineCreateOptions {
		const configOption = {
			...config.options,
			name: QemuServiceHelper.optionsToName( {
				helperId,
				label: config.appName,
				version: config.version,
			} ),
		};
		return configOption;
	}

	public async start( appName: string, version?: string ): Promise<QemuServiceHelper> {
		const helperId = this.genId();
		const appConfig = await this.appStoreService.getApp( appName, version ).toPromise();
		const vmCreateOptions = this.castAppParamsToContainerConfig( appConfig, helperId );
		console.log(vmCreateOptions);
		spawn( appName, [vmCreateOptions] );
	}

	public async stop( id: string ) {
		throw new Error( 'Not implemented yet' );
	}

	public async status( id: string ): Promise<IVirtualMachineStats> {
		throw new Error( 'Not implemented yet' );
	}

	public async createImage( imgName: string, imgSize: string, format?: string ) {
		return spawn( 'qemu-img', [
									'create',
									'-f',
									format || 'qcow2',
									imgName,
									imgSize,
								] );
	}

	public get( id: string ): QemuServiceHelper | undefined {
		throw new Error( 'Not implemented yet' );
	}
}
