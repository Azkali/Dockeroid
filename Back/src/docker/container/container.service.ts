import { Inject, Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';
import { Container, ContainerCreateOptions, ContainerStats } from 'dockerode';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { Stream } from 'stream';
import { Logger } from 'winston';
import { AppStoreService, IAppWithParams } from '../../global/app-store/app-store.service';
import { AAppService } from '../../services/a-app-service';
import { IAppConfig, IHypervisorService } from '../../services/i-hypervisor-service';
import { DockerInstance, Label } from './container-service-helper';

const MANAGER = 'Dockeroid';
type OnProgress = ( event: any ) => void;

@Injectable()
export class DockerHypervisorService extends AAppService implements IHypervisorService<DockerInstance, IAppConfig, ContainerStats> {
	private readonly docker = new Docker();
	private readonly containersSubject = new BehaviorSubject<Map<Label, DockerInstance>>( new Map<Label, DockerInstance>() );
	// TODO: Maybe cast DockerServiceHelper to hide properties, like the underlying container itself
	public readonly containers: Observable<ReadonlyMap<Label, DockerInstance>> = this.containersSubject.asObservable();

	public constructor(
			@Inject( 'winston' ) private readonly logger: Logger,
			private readonly appStoreService: AppStoreService,
		) {
		super( 'docker' );
		this.list()
			.then( async containers => {
				await Promise.all( Object.entries( containers ).map( async ( [containerLabel, container] ) => {
					const { helperId, app, version } = DockerInstance.labelToAppInstance( containerLabel );
					const config = await this.appStoreService.getApp( app, version ).toPromise();
					const helper = new DockerInstance(
						this,
						helperId,
						config,
						this.docker.getContainer( container.id ),
					);
					this.containersSubject.value.set( helperId, helper );
				} ) );
				this.containersSubject.next( this.containersSubject.value );
			} )
			.catch( err => logger.error( err ) );
	}

	/**
	 * Takes an app configuration and casts it into a ContainerCreateOptions
	 * @param config - App configuration
	 * @param helperId - Id to assign to the container at start
	 * @returns Containers option
	 */
	private castAppParamsToContainerConfig( config: IAppWithParams<any>, helperId: string ): ContainerCreateOptions {
		const configOption: ContainerCreateOptions = {
			...config.options,
			Image: config.image,
			Labels: {
				...config.options.Labels,
				Manager: MANAGER,
			},
			name: DockerInstance.appInstanceToLabel( {
				app: config.name,
				helperId,
				version: config.version,
			} ),
		};
		return configOption;
	}

	public start( name: string ) {
		return this.startWithVersion( name );
	}

	/**
	 * Starts a container
	 * @param name - Name of the application to start in a container
	 * @param version - Version of the app found in json file; default value is latest
	 * @returns Configuration of the Container
	 */
	public async startWithVersion( name: string, version?: string ) {
		const helperId = this.genId();
		const appConfig = await this.appStoreService.getApp( name, version ).toPromise();
		if ( !this.imageExists( appConfig.image ) ) {
			await this.pullImage( appConfig.image, {} );
		}
		const containerCreateOptions = this.castAppParamsToContainerConfig( appConfig, helperId );
		this.logger.log( { level: 'info', message: `Starting container ${appConfig.name} v${appConfig.version} with options ${containerCreateOptions}` } );
		const container = await new Promise<Container>(
			( res, rej ) => this.docker.createContainer(
				containerCreateOptions,
				( err, out ) => err ? rej( err ) : res( out ) ) );
		const helper = new DockerInstance( this, helperId, appConfig, container );
		const newMap = new Map( this.containersSubject.value );
		newMap.set( helperId, helper );
		this.containersSubject.next( newMap );
		return helper;
	}

	/**
	 * List all avalaible containers
	 * @returns List of containers with information
	 */
	public async list(): Promise<{[key: string]: DockerInstance}> {
		return this.containers.pipe(
				first(),
				map( helpersMap => Object.fromEntries( helpersMap.entries() ) ),
			).toPromise();
	}

	/**
	 * Get the status of a running Container
	 * @param id - Id of a running container
	 * @returns Status information of a runnning container
	 * @throws Unknown id; Container is not running or does not exixts
	 */
	public async status( id: string ): Promise<ContainerStats> {
		const containerHelper = this.get( id );
		if ( !containerHelper ) {
			throw new Error( `Unknown container ID ${id}` );
		}
		return containerHelper.container.stats();
	}

	/**
	 * Stop a running Container
	 * @param id - Id of a running container
	 * @returns Void
	 * @throws Unknown id; Container is not running or does not exixts
	 */
	public async stop( id: string ): Promise<void> {
		if ( !this.containersSubject.value.has( id ) ) {
			throw new Error( `Unknown container ID ${id}` );
		}
		await this.containersSubject.value.get( id )!.stop();
		this.containersSubject.value.delete( id );
		this.containersSubject.next( this.containersSubject.value );
	}

	/**
	 * Get the configuration used by a running Container
	 * @param id - Id of a running Container
	 * @returns Configuration of the Container
	 */
	public get( id: string ): DockerInstance | undefined {
		return this.containersSubject.value.get( id );
	}

	/**
	 * Retrieves a Container avalaible online
	 * @param image - Name of the container to pull
	 * @param options - Additional argument for the pull
	 * @param onProgress - Pull progress
	 */
	private async pullImage( image: string, options: {}, onProgress?: OnProgress ): Promise<Docker.Image> {
		return new Promise( async ( res, rej ) => {
			const imageWithTag = ( image.indexOf( ':' ) > 0 )
			? image : `${image}:latest`;
			this.logger.log( { message: `Trying to pull image ${imageWithTag}`, level: 'info' } );
			this.docker.pull( imageWithTag, { options }, ( err, stream: Stream ) => {
				if ( err ) {
					rej( err );
				}
				if ( !stream ) {
					throw new Error( `Image '${imageWithTag}' doesn't exists` );
				}
				this.docker.modem.followProgress( stream, ( error: any, out: any ) => {
					if ( error ) {
						rej( error );
					}
					res( this.docker.getImage( imageWithTag ) );
				},                                onProgress );
			} );
		} );
	}

	/**
	 * Check if a Container exists online
	 * @param image - Name of the container to pull
	 * @returns true if a container with the provided name exists online; false if the container does not exist
	 */
	private async imageExists( image: string ): Promise<boolean> {
		const images = await this.docker.listImages( { filters: { reference: [image] }} );
		return images.length > 0;
	}

	// WIP
	/**
	 * Lists all avalaible volumes of a container
	 * @param id - Id of the running container
	 */
	public async listVolumes( id: string ) {
		const containerHelper = this.get( id );
		if ( !containerHelper ) {
			throw new Error( `Unknow container with id ${id}` );
		}
		const allVolumes = await this.docker.listVolumes();
		this.logger.log( { message: `Avalaible volumes ${allVolumes}`, level: 'info' } );
		return containerHelper.container.inspect()
		.then( volumes => {
			this.logger.log( { message: `Mounted volumes: ${volumes.Mounts}`, level: 'info' } );
			return volumes.Config.Volumes;
		} );
	}

	public infos( name: string ) {
		return this.infosWithVersion( name );
	}

	public infosWithVersion( name: string, version?: string ) {
		return this.appStoreService.getApp( name, version );
	}
}
