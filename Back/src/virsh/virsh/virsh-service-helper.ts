import { IAppConfig, IHypervisorInstance } from '../../services/i-hypervisor-service';
import { VirshHypervisorService } from './virsh.service';

export interface IVirshServiceOptions {
	app: string;
	version: string;
	helperId: string;
}

export interface IVirshDomain {
	id: string;
	name: string;
	state: string;
}

export type Label = string;

export class VirshServiceHelper implements IHypervisorInstance<VirshHypervisorService, IAppConfig, IVirshDomain> {
	public constructor(
		public readonly relatedService: VirshHypervisorService,
		public readonly id: string,
		public readonly appConfig: IAppConfig ) { }

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
	 * Converts a label, helperId and version to a single string representing the id
	 *
	 * @param IVirshServiceOptions - { label, helperId, version }
	 *
	 * @returns A single concatenated string
	 */
	public static optionsToName( { app, helperId, version }: IVirshServiceOptions ): string {
		return `${app}__${version}__${helperId}`;
	}

	/**
	 * Extracts a label, helperId and version from an id
	 *
	 * @param name - a string containing the id
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
		const [, app, version, helperId] = match;
		return { app, version, helperId };
	}
}
