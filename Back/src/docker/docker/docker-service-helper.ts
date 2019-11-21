import { Container, ContainerStats } from 'dockerode';
import { IAppConfig, IAppHelper } from '../../services/app-interface';
import { DockerService } from './docker.service';

export interface IDockerServiceOptions {
	app: string;
	version: string;
	helperId: string;
}
export type Label = string;

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

	public static appInstanceToLabel( { app, helperId, version }: IDockerServiceOptions ): Label {
		return `${app}__${version}__${helperId}`;
	}
	public static labelToAppInstance( label: Label ): IDockerServiceOptions {
		const match = label.match( /^\/?(.+?)__(.+?)__(.+?)$/ );
		if ( !match ) {
			throw new Error( 'Invalid parsed name' );
		}
		const [, app, version, helperId] = match;
		return { app, version, helperId };
	}
}
