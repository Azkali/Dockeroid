import { Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';
import { Container, ContainerStats, ContainerCreateOptions } from 'dockerode';
import { BehaviorSubject } from 'rxjs';
import { IAppConfig, IAppServiceInterface } from '../app-interface';
import { DockerServiceHelper } from './docker-service-helper';
import { Dictionary } from 'lodash';
import { AAppService } from './a-app-service';

export interface IContainerConfig extends IAppConfig {
	mountPoints?: Dictionary<string>;
}

@Injectable()
export class DockerService extends AAppService implements IAppServiceInterface<DockerServiceHelper, IContainerConfig, ContainerStats> {
	private readonly docker = new Docker();
	private readonly containers = new BehaviorSubject<ReadonlyMap<string, DockerServiceHelper | undefined>>( new Map<string, DockerServiceHelper | undefined>() );
	
	public constructor() { super( 'docker' ); }
	
	private castConfig(config: IContainerConfig, containerName: string): ContainerCreateOptions {
		const configOption: ContainerCreateOptions = { Image: config.name, name: containerName } ;
		return configOption;
	}

	public async start( config: IContainerConfig ) {
		const helperId = this.genId();
		const containerInfos = await new Promise<Container>(
			( res, rej ) => this.docker.createContainer(
				this.castConfig( config, helperId ),
				( err, out ) => err ? rej( err ) : res( out ) ) );
		const helper = new DockerServiceHelper( this, helperId, containerInfos );
		const newMap = new Map( this.containers.value );
		newMap.set( helperId, helper );
		this.containers.next( newMap );
		return helper;
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
