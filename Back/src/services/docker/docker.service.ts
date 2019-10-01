import { Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';
import { Container, ContainerCreateOptions, ContainerStats } from 'dockerode';
import { Dictionary } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { Stream } from 'stream';
import { IAppConfig, IAppServiceInterface } from '../app-interface';
import { AppStoreService, IAppWithParams } from '../app-store/app-store.service';
import { AAppService } from './a-app-service';
import { DockerServiceHelper } from './docker-service-helper';

const MANAGER = 'Dockeroid';
type OnProgress = ( event: any ) => void;

@Injectable()
export class DockerService extends AAppService implements IAppServiceInterface<DockerServiceHelper, IAppConfig, ContainerStats> {
	private readonly docker = new Docker();
	private readonly containersSubject = new BehaviorSubject<Map<string, DockerServiceHelper>>( new Map<string, DockerServiceHelper>() );
	// TODO: Maybe cast DockerServiceHelper to hide properties, like the underlying container itself
	public readonly containers: Observable<ReadonlyMap<string, DockerServiceHelper>> = this.containersSubject.asObservable();

	public constructor( private readonly appStoreService: AppStoreService ) {
		super( 'docker' );
		this.listContainers()
			.then( async containers => {
				await Promise.all( containers.map( async container => {
					const { helperId, label, version } = DockerServiceHelper.nameToOptions( container.Names[0] );
					const config = await this.appStoreService.getApp( label, version ).toPromise();
					const helper = new DockerServiceHelper(
						this,
						helperId,
						config,
						this.docker.getContainer( container.Id ),
					);
					this.containersSubject.value.set( helperId, helper );
				} ) );
				this.containersSubject.next( this.containersSubject.value );
			} )
			.catch( err => console.error( err ) );
	}

	private castAppParamsToContainerConfig( config: IAppWithParams<any>, helperId: string ): ContainerCreateOptions {
		const configOption: ContainerCreateOptions = {
			...config.options,
			Image: config.image,
			Labels: {
				...config.options.Labels,
				Manager: MANAGER,
			},
			name: DockerServiceHelper.optionsToName( {
				helperId,
				label: config.appName,
				version: config.version,
			} ),
		};
		return configOption;
	}

	public async start( appName: string, version?: string ) {
		const helperId = this.genId();
		const appConfig = await this.appStoreService.getApp( appName, version ).toPromise();
		if ( !this.imageExists( appConfig.image ) ) {
			await this.pullImage( appConfig.image, {} );
		}
		const containerCreateOptions = this.castAppParamsToContainerConfig( appConfig, helperId );
		console.log( `Starting container ${appConfig.appName} v${appConfig.version} with options`, containerCreateOptions );
		const container = await new Promise<Container>(
			( res, rej ) => this.docker.createContainer(
				containerCreateOptions,
				( err, out ) => err ? rej( err ) : res( out ) ) );
		const helper = new DockerServiceHelper( this, helperId, appConfig, container );
		const newMap = new Map( this.containersSubject.value );
		newMap.set( helperId, helper );
		this.containersSubject.next( newMap );
		return helper;
	}

	private async listContainers(): Promise<Docker.ContainerInfo[]> {
		const containers = await this.docker.listContainers();
		return containers.filter( container => container.Labels.Manager === MANAGER );
	}

	public async status( id: string ): Promise<ContainerStats> {
		const containerHelper = this.get( id );
		if ( !containerHelper ) {
			throw new Error( `Unknown container ID ${id}` );
		}
		return containerHelper.container.stats();
	}

	public async stop( id: string ): Promise<void> {
		if ( !this.containersSubject.value.has( id ) ) {
			throw new Error( `Unknown container ID ${id}` );
		}
		await this.containersSubject.value.get( id )!.stop();
		this.containersSubject.value.delete( id );
		this.containersSubject.next( this.containersSubject.value );
	}

	public get( id: string ): DockerServiceHelper | undefined {
		return this.containersSubject.value.get( id );
	}

	private async pullImage( image: string, options: {}, onProgress?: OnProgress ): Promise<Docker.Image> {
		return new Promise( async ( res, rej ) => {
			const imageWithTag = ( image.indexOf( ':' ) > 0 )
			? image : `${image}:latest`;
			console.log( `Trying to pull image ${imageWithTag}` );
			this.docker.pull( imageWithTag, { options }, ( err, stream: Stream ) => {
				if ( err ) {
					rej( err );
				}
				if ( !stream ) {
					throw new Error( `Image '${imageWithTag}' doesn't exists` );
				}
				this.docker.modem.followProgress( stream, ( err: any, out: any ) => {
					if ( err ) {
						rej( err );
					}
					res( this.docker.getImage( imageWithTag ) );
				},                                onProgress );
			} );
		} );
	}

	private async imageExists( image: string ): Promise<boolean> {
		const images = await this.docker.listImages( { filters: { reference: [image] }} );
		return images.length > 0;
	}
}
