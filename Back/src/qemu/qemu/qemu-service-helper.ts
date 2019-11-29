import { IAppConfig, IAppHelper } from '../../services/app-interface';
import { IVirtualMachineStats, Qemu } from './qemu';
import { QemuService } from './qemu.service';

export interface IQemuServiceOptions {
	label: string;
	version: string;
	helperId: string;
}
export class QemuServiceHelper implements IAppHelper<QemuService, IAppConfig, IVirtualMachineStats> {
	public constructor(
		public readonly relatedService: QemuService,
		public readonly id: string,
		public readonly appConfig: IAppConfig,
		public readonly qemu: Qemu ) {}

	public async stop() {
		return this.qemu.stop( this.id );
	}
	public async status() {
		return this.qemu.status( this.id );
	}

	public async list() {
		return this.qemu.listAll();
	}

	public static optionsToName( { label, helperId, version }: IQemuServiceOptions ): string {
		return `${label}__${version}__${helperId}`;
	}
	public static nameToOptions( name: string ): IQemuServiceOptions {
		const match = name.match( /^\/?(.+?)__(.+?)__(.+?)$/ );
		if ( !match ) {
			throw new Error( 'Invalid parsed name' );
		}
		const [, label, version, helperId] = match;
		return { label, version, helperId };
	}
}
