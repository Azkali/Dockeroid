import { Container, ContainerStats } from 'dockerode';
import { IAppConfig, IHypervisorInstance } from '../../services/i-hypervisor-service';
import { DockerHypervisorService } from './container.service';

export interface IDockerServiceOptions {
	app: string;
	version: string;
	helperId: string;
}

export type Label = string;

export class DockerInstance implements IHypervisorInstance<DockerHypervisorService, IAppConfig, ContainerStats> {

	public constructor(
		public readonly relatedService: DockerHypervisorService,
		public readonly id: string,
		public readonly appConfig: IAppConfig,
		public readonly container: Container ) { }

	/**
	 * Stop a container
	 *
	 * @returns A promise of any
	 */
	public async stop() {
		return this.container.stop();
	}
	/**
	 * Get the status a container
	 *
	 * @returns A promise of Dockerode.ContainerStats
	 */
	public async status() {
		return this.container.stats();
	}

	/**
	 * Converts a label, helperId and version to a single string representing the id
	 *
	 * @param IDockerServiceOptions - { label, helperId, version }
	 *
	 * @returns A single concatenated string
	 */
	public static appInstanceToLabel( { app, helperId, version }: IDockerServiceOptions ): Label {
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
	public static labelToAppInstance( label: Label ): IDockerServiceOptions {
		const match = label.match( /^\/?(.+?)__(.+?)__(.+?)$/ );
		if ( !match ) {
			throw new Error( 'Invalid parsed name' );
		}
		const [, app, version, helperId] = match;
		return { app, version, helperId };
	}
}
