import { Catch, Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { Dictionary } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppStoreService, IAppWithParams } from '../../global/app-store/app-store.service';
import { AAppService } from '../../services/a-app-service';
import { IAppConfig, IAppServiceInterface } from '../../services/app-interface';
import { IVirtualMachineCreateOptions, IVirtualMachineStats, Qemu } from './qemu';
import { QemuServiceHelper } from './qemu-service-helper';

@Injectable()
export class QemuService extends AAppService implements IAppServiceInterface<QemuServiceHelper, IAppConfig, IVirtualMachineStats> {
	// TODO: Implement Qemu class with status, start, stop, create funcs
	private readonly qemu = new Qemu( this );
	private readonly virtSubject = new BehaviorSubject<Map<string, QemuServiceHelper>>( new Map<string, QemuServiceHelper>() );
	// TODO: Maybe cast QemuServiceHelper to hide properties, like the underlying vm itself
	public readonly virt: Observable<ReadonlyMap<string, QemuServiceHelper>> = this.virtSubject.asObservable();
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
		console.log( vmCreateOptions );
		spawn( appName, vmCreateOptions.args );
		return new QemuServiceHelper( this, helperId , { appName }, this.qemu );
	}

	public async stop( id: string ): Promise<void> {
		return this.qemu.stop( id );
	}

	public async status( id: string ): Promise<IVirtualMachineStats> {
		return this.qemu.status( id );
	}

	public async list(): Promise<Dictionary<QemuServiceHelper>> {
		return this.qemu.listAll();
	}

	public get( id: string ): QemuServiceHelper | undefined {
		return this.qemu.get( id );
	}
}