import { IAppConfig, IAppHelper } from '../../services/app-interface';
import { Virsh } from './virsh';
import { IVirtualMachineStats, VirshService } from './virsh.service';

export interface IVirshServiceOptions {
	label: string;
	version: string;
	helperId: string;
}
export class VirshServiceHelper implements IAppHelper<VirshService, IAppConfig, IVirtualMachineStats> {
	public constructor(
		public readonly relatedService: VirshService,
		public readonly id: string,
		public readonly appConfig: IAppConfig,
		public readonly virsh: Virsh ) {}

	/**
	 * Stop a runnning VM
	 *
	 * @returns  A promise of the stop action
	 */
	public async stop() {
		return this.relatedService.shutdown( this.id );
	}
	/**
	 * Get the status a VM
	 *
	 * @returns A promise of the status
	 */
	public async status() {
		return this.relatedService.status( this.id );
	}

	/**
	 * Converts a label, helperId and version to a single string representing the appId
	 *
	 * @param IDockerServiceOptions - { label, helperId, version }
	 *
	 * @returns A single concatenated string
	 */
	public static optionsToName( { label, helperId, version }: IVirshServiceOptions ): string {
		return `${label}__${version}__${helperId}`;
	}

	/**
	 * Extracts a label, helperId and version from an appId
	 *
	 * @param name - a string containing the appId
	 *
	 * @returns An object containing the label, helperId and version of the application
	 *
	 * @throws Invalid name
	 */
	public static nameToOptions( name: string ): IVirshServiceOptions {
		const match = name.match( /^\/?(.+?)__(.+?)__(.+?)$/ );
		if ( !match ) {
			throw new Error( 'Invalid parsed name' );
		}
		const [, label, version, helperId] = match;
		return { label, version, helperId };
	}
}
