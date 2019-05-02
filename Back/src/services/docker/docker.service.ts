import { Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { IAppHelper, IAppInterface } from '../appInterface';
import { DockerServiceHelper } from './docker-service-helper';

interface IContainerConfig {
	Image: string;
	AttachStdin: boolean;
	AttachStdout: boolean;
	AttachStderr: boolean;
	Tty: boolean;
	Cmd: any[];
	OpenStdin: boolean;
	StdinOnce: boolean;
}

@Injectable()
export class DockerService implements IAppInterface<IContainerConfig, DockerServiceHelper> {
	private readonly docker = new Docker();
	private readonly containers = new BehaviorSubject<ReadonlyMap<string, IAppHelper>>( new Map<string, IAppHelper>() );

	public async start( config: IContainerConfig ) {
		const containerInfos = await new Promise<Docker.Container>(
			( res, rej ) => this.docker.createContainer(
				config,
				( err, out ) => err ? rej( err ) : res( out ) ) );
		const id = 'foobarqux';
		const helper = new DockerServiceHelper( this, id, containerInfos );
		const newMap = new Map( this.containers.value );
		newMap.set( id, helper );
		this.containers.next( newMap );
		return helper;
	}

	public async status( id: string ): Promise<void> {
		const containerStats = await new Promise<void>( ( res, rej ) => this.docker.getContainer( id ).stats( id ) );
		return containerStats;
	}
	public async stop( id: string ): Promise<void> {
		const containerStop = await new Promise<void>( ( res, rej ) => this.docker.getContainer( id ).stop( id ) );
		return containerStop;
	}

	public async get( id: string ) {
		return this.containers.getValue( ).get( id );
	}
}
