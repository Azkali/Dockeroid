import { Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';
import { Container, ContainerCreateOptions, ContainerStats } from 'dockerode';
import { BehaviorSubject, Observable } from 'rxjs';
import { Stream } from 'stream';

import { Dictionary } from 'lodash';
import { first, map } from 'rxjs/operators';
import { AppStoreService, IAppWithParams } from '../../global/app-store/app-store.service';
import { AAppService } from '../../services/a-app-service';
import { IAppConfig, IAppServiceInterface } from '../../services/app-interface';
import { DockerServiceHelper, Label } from './docker-service-helper';

const MANAGER = 'Dockeroid';
type OnProgress = ( event: any ) => void;

@Injectable()
export class DockerService extends AAppService implements IAppServiceInterface<DockerServiceHelper, IAppConfig, ContainerStats> {
	private readonly docker = new Docker();
	private readonly containersSubject = new BehaviorSubject<Map<Label, DockerServiceHelper>>( new Map<Label, DockerServiceHelper>() );
	// TODO: Maybe cast DockerServiceHelper to hide properties, like the underlying container itself
	public readonly containers: Observable<ReadonlyMap<Label, DockerServiceHelper>> = this.containersSubject.asObservable();

	public constructor( private readonly appStoreService: AppStoreService ) {
		super( 'docker' );
		this.list()
			.then( async containers => {
				await Promise.all( Object.entries( containers ).map( async ( [containerLabel, container] ) => {
					const { helperId, app, version } = DockerServiceHelper.labelToAppInstance( containerLabel );
					const config = await this.appStoreService.getApp( app, version ).toPromise();
					const helper = new DockerServiceHelper(
						this,
						helperId,
						config,
						this.docker.getContainer( container.id ),
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
			name: DockerServiceHelper.appInstanceToLabel( {
				helperId,
				app: config.appName,
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
		newMap.set( DockerServiceHelper.appInstanceToLabel( { app: appName, version: appConfig.version, helperId } ), helper );
		this.containersSubject.next( newMap );
		return helper;
	}

	public async list(): Promise<{[key: string]: DockerServiceHelper}> {
		return this.containers.pipe(
				first(),
				map( helpersMap => Object.fromEntries( helpersMap.entries() ) ),
			).toPromise();
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
