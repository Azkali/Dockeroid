import { Inject, Injectable } from '@nestjs/common';
import { spawn, SpawnOptions, StdioOptions } from 'child_process';
import { Dictionary } from 'lodash';
import { isNullOrUndefined } from 'util';
import { Logger } from 'winston';
import { AppStoreService, IAppWithParams } from '../../global/app-store/app-store.service';
import { AAppService } from '../../services/a-app-service';
import { IAppConfig, IHypervisorService } from '../../services/i-hypervisor-service';
import { IVirshDomain, VirshServiceHelper } from './virsh-service-helper';
import { Label } from './virsh-service-helper';

export interface IVirtualMachineCreateOptions extends SpawnOptions {
	cwd?: string;
	env?: NodeJS.ProcessEnv;
	argv0?: string;
	stdio?: StdioOptions;
	detached?: boolean;
	uid?: number;
	gid?: number;
	shell?: boolean | string;
	windowsVerbatimArguments?: boolean;
	windowsHide?: boolean;
}

@Injectable()
export class VirshHypervisorService extends AAppService implements IHypervisorService<VirshServiceHelper, IAppConfig, IVirshDomain> {

	public constructor(
		@Inject( 'winston' ) private readonly logger: Logger,
		private readonly appStoreService: AppStoreService,
	) { super( 'virsh' ); }

	/**
	 * Determinates if a string is null, undefined or empty
	 * @param option - Optional test condition
	 * @param errorMsg - Error message to output
	 * @param testCondition - Main test condition
	 */
	private isNouOrEmpty( option: string | string[], errorMsg?: string, testCondition?: any ) {
		if ( !( option instanceof Array ) ) {
			if ( !( isNullOrUndefined( testCondition ) || testCondition === '' ) ) {
				if ( isNullOrUndefined( option ) || option === '' || testCondition ) {
					throw new Error( errorMsg || `Couldn't find ${option}` );
				}
			} else {
				if ( isNullOrUndefined( option ) || option === '' ) {
					throw new Error( errorMsg || `Couldn't find ${option}` );
				}
			}
		} else {
			option.forEach( opt => this.isNouOrEmpty( opt ) );
		}
	}
	/**
	 * Takes an app configuration and casts it into a VirtualMachineCreateOptions
	 * @param config - App configuration
	 * @param helperId - Id to assign to the VM at start
	 * @returns VM options
	 */
	private castAppParamsToContainerConfig( config: IAppWithParams<any>, helperId: string ): IVirtualMachineCreateOptions {
		const configOption: IVirtualMachineCreateOptions = {
			...config.options,
			name: VirshServiceHelper.optionsToName( {
				app: config.image,
				helperId,
				version: config.version,
			} ),
		};
		return configOption;
	}

	/**
	 * Starts a VM
	 * @param name - Name of the application to start in a VM
	 * @param version - Version of the app found in json file; default value is latest
	 * @returns Configuration of the VM
	 */
	public async startWithVersion( name: string, version?: string ): Promise<VirshServiceHelper> {
		const helperId = this.genId();
		const appConfig = await this.appStoreService.getApp( name, version ).toPromise();
		const vmCreateOptions = this.castAppParamsToContainerConfig( appConfig, helperId );
		this.logger.log( { level: 'info', message: `${vmCreateOptions}` } );
		const helper = new VirshServiceHelper( this, helperId, appConfig );
		spawn( 'virsh', [name], vmCreateOptions );
		return helper;
	}

	/**
	 * Stop a running VM
	 * @param id - Id of a running VM
	 * @returns Void
	 * @throws Unknown id; VM is not running or does not exixts
	 */
	public async stop( id: string ) {
		this.isNouOrEmpty( id );
		const stopHelper = spawn( 'virsh', ['shutdown', id] )
			.stdout.on( 'data', data => {
				this.logger.log( data );
				return data;
			} );
		return stopHelper.read();
	}

	/**
	 * Get the status of a running VM
	 * @param id - Id of a running VM
	 * @returns Status information of a runnning VM
	 * @throws Unknown id; VM is not running or does not exixts
	 */
	public async status( id: string ): Promise<IVirshDomain> {
		const status = spawn( 'virsh', ['domstate', id] )
			.stdout.on( 'data', data => data );
		return status.read();
	}
	/**
	 * Creates a virtualdisk image to store data
	 * @param imgName - Name to give to the img file
	 * @param imgSize - Size to allocate in GB
	 * @param format - Format of the image | default: qcow2
	 */
	public async createImage( imgName: string, imgSize: string, format?: string ) {
		this.isNouOrEmpty( imgName );
		return spawn( 'virsh-img', [
			'create',
			'-f',
			format || 'qcow2',
			imgName,
			imgSize,
		] )
			.stdout.on( 'data', data => {
				this.logger.log( data );
				return data;
			} );
	}

	/**
	 * List all available VM's
	 * @returns A dictionnary containing all VM on the system
	 */
	public async list(): Promise<{ [key: number]: VirshServiceHelper }> {
		const output = await new Promise<string>( ( res, rej ) => {
			let out = '';
			const childProc = spawn( 'virsh', ['list', '--all'] );
			childProc.stdout.on( 'data', buffer => out += buffer.toString() );
			childProc.on( 'exit', exitCode => exitCode !== 0 ?
				rej( new Error( 'Non 0 exit code' ) ) :
				res( out ) );
		} );

		const listOfVm = output.split( /^-{3,}$/gm )[1];

		const vmProperties: VirshServiceHelper[] = listOfVm.split( /\r?\n/ )
			.filter( Boolean )
			.map( ( vm => {
				const regex = /^\s*(\S+)\s+(\S+)\s+(\S+(?:\s\S+)*)$/gm;
				const [, id, name, state] = regex.exec( vm ) || [];
				return new VirshServiceHelper( this, id, { name: name } );
			} ) );

		const vmDict = vmProperties.reduce<Dictionary<VirshServiceHelper>>( ( res, item, idx ) => ( { ...res, [idx]: item } ), {} );
		return vmDict;
	}

	/**
	 * Stop/Shutdown a VM
	 * @param vmName - VM name set in the repository file
	 */
	public shutdown( vmName: string ) {
		spawn( 'virsh', ['shutdown', vmName] );
	}

	/**
	 * Destroy a VM
	 * @param vmName - VM name set in the repository file
	 */
	public destroy( vmName: string ) {
		this.isNouOrEmpty( vmName );
		return spawn( 'virsh', ['destroy', vmName] );
	}

	/**
	 * Create a VM
	 * @param vmName - VM name set in the repository file
	 */
	public create( options: IVirtualMachineCreateOptions, name: string ) {
		return spawn( 'virt-install', ['-n', name], options ).stdout.on( 'data', data => {
			this.logger.log( data );
			return data;
		} );
	}

	/**
	 * Delete/Undefine a VM
	 * @param vmName - VM name set in the repository file
	 */
	public delete( vmName: string ) {
		this.isNouOrEmpty( vmName );
		this.destroy( vmName );
		return spawn( 'virsh', ['undefine', vmName] );
	}

	/**
	 * Retrieve informations about a given VM domain
	 * @param vmName - VM name set in the repository file
	 */
	public get( vmName: string ): VirshServiceHelper {
		this.isNouOrEmpty( vmName );
		return spawn( 'virsh', ['get', vmName] )
			.stdout.on( 'data', data => data ).read();
	}

	public start( name: string ): Promise<VirshServiceHelper> {
		return this.startWithVersion( name );
	}

	public infos( name: string ) {
		this.infosWithVersion( name );
	}

	public infosWithVersion( name: string, version?: string ) {
		return this.appStoreService.getApp( name, version );
	}

	public listVolumes( id: string ) {
		return '';
	}
	// private fetchMetadata( set: string, uri: string ): IAppConfig {
	// 	this.isNouOrEmpty( [set, uri] );
	// 	spawn( 'virsh', ['metadata', `--set ${set}`, `--uri ${uri}`] ).stdout.on( 'data', data => data );
	// 	return ;
	// }
}
