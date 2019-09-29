import { Container, ContainerStats } from 'dockerode';
import { IAppConfig, IAppHelper } from '../app-interface';
import { DockerService } from './docker.service';

export interface IDockerServiceOptions {
	label: string;
	version: string;
	helperId: string;
}
export class DockerServiceHelper implements IAppHelper<DockerService, IAppConfig, ContainerStats> {

	public constructor(
		public readonly relatedService: DockerService,
		public readonly id: string,
		public readonly appConfig: IAppConfig,
		public readonly container: Container ) {}

	public async stop() {
		return this.container.stop();
	}
	public async status() {
		return this.container.stats();
	}

	public static optionsToName( { label, helperId, version }: IDockerServiceOptions ): string {
		return `${label}__${version}__${helperId}`;
	}
	public static nameToOptions( name: string ): IDockerServiceOptions {
		const match = name.match( /^\/?(.+?)__(.+?)__(.+?)$/ );
		if ( !match ) {
			throw new Error( 'Invalid parsed name' );
		}
		const [, label, version, helperId] = match;
		return { label, version, helperId };
	}
}
