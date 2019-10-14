import { IAppConfig, IAppHelper } from '../../services/app-interface';
import { QemuService } from './qemu.service';
import { Qemu, IVirtualMachineStats } from './qemu';

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
		return this.qemu.shutdown( this.id );
	}
	public async status() {
		return this.qemu.status( this.id );
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
