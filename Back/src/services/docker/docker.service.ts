import { Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';
import { Container, ContainerCreateOptions, ContainerStats } from 'dockerode';
import { Dictionary } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { IAppConfig, IAppServiceInterface } from '../app-interface';
import { AppStoreService, IAppWithParams } from '../app-store/app-store.service';
import { AAppService } from './a-app-service';
import { DockerServiceHelper } from './docker-service-helper';

export interface IContainerConfig extends IAppConfig {
	mountPoints?: Dictionary<string>;
	OpenStdin?: boolean;
	Tty?: boolean;
	AttachStderr?: boolean;
	AttachStdout?: boolean;
	AttachStdin?: boolean;
}

const MANAGER = 'Dockeroid';

@Injectable()
export class DockerService extends AAppService implements IAppServiceInterface<DockerServiceHelper, IContainerConfig, ContainerStats> {
	private readonly docker = new Docker();
	private readonly containers = new BehaviorSubject<ReadonlyMap<string, DockerServiceHelper | undefined>>( new Map<string, DockerServiceHelper | undefined>() );

	public constructor( private readonly appStoreService: AppStoreService ) { super( 'docker' ); }

	private castAppParamsToContainerConfig( config: IAppWithParams<any>, helperId: string ): ContainerCreateOptions {
		const configOption: ContainerCreateOptions = {
			...config.options,
			Image: config.image,
			name: `${config.label}__${config.version}__${helperId}`,
			Labels: {
				...config.options.Labels,
				Manager: MANAGER,
			}
		};
		return configOption;
	}

	public async start( appName: string, version?: string ) {
		const helperId = this.genId();
		const appConfig = await this.appStoreService.getApp(appName, version).toPromise();
		const containerCreateOptions = this.castAppParamsToContainerConfig( appConfig, helperId );
		console.log(`Starting container ${appConfig.label} v${appConfig.version} with options`, containerCreateOptions)
		const containerInfos = await new Promise<Container>(
			( res, rej ) => this.docker.createContainer(
				containerCreateOptions,
				( err, out ) => err ? rej( err ) : res( out ) ) );
		const helper = new DockerServiceHelper( this, helperId, containerInfos );
		const newMap = new Map( this.containers.value );
		newMap.set( helperId, helper );
		this.containers.next( newMap );
		return helper;
	}

	public async listContainers() {
		const containers = await this.docker.listContainers();
		return containers.filter(container => container.Labels.Manager === MANAGER);
	}

	public async pullImage( tag: string ) {
		const pullHelper = await this.docker.pull( tag, {} );
		return pullHelper;
	}

	public async status( id: string ): Promise<ContainerStats> {
		const containerStats = this.docker.getContainer( id ).stats();
		return containerStats;
	}
	public async stop( id: string ): Promise<void> {
		await this.docker.getContainer( id ).stop();
	}
	public get( id: string ): DockerServiceHelper | undefined {
		const containerInfos = this.containers.getValue().get( id );
		return containerInfos;
	}
}
