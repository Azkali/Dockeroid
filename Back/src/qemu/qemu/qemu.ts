import { spawn } from 'child_process';
import { SpawnOptions } from 'child_process';
import { Dictionary } from 'lodash';
import { IAppConfig } from 'src/services/app-interface';
import { isNullOrUndefined } from 'util';
import { QemuServiceHelper } from './qemu-service-helper';
import { QemuService } from './qemu.service';

export interface IVirtualMachineCreateOptions   {
	name: string;
	args: SpawnOptions;
}

export interface IVirtualMachineStats {}

export class Qemu {

	public constructor( private readonly qemuService: QemuService ) {}

	private isNouOrEmpty( option: string | string[] , errorMsg?: string, testCondition?: any ) {
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

	public start( vmName: string ) {
		this.isNouOrEmpty( vmName );
		return spawn( 'virsh', ['start', vmName ] );
	}

	public stop( vmName: string ) {
		this.isNouOrEmpty( vmName );
		return spawn( 'virsh', ['shutdown', vmName] );
	}

	public destroy( vmName: string ) {
		this.isNouOrEmpty( vmName );
		return spawn( 'virsh', ['destroy', vmName] );
	}

	public async status( vmName ?: string ) {
		return spawn( 'virsh', ['list', vmName || ''] );
	}

	public create( options: IVirtualMachineCreateOptions ) {
		return spawn( 'virt-install', ['-n', options.name], options.args ).stdout.on( 'data', data => {
			console.log( data );
			return data;
		},
		);
	}

	public async listAll(): Promise < QemuServiceHelper[] > {
		const output = await new Promise<string>( ( res, rej ) => {
			let out = '';
			const childProc = spawn( 'virsh', ['list', '--all'] );
			childProc.stdout.on( 'data', buffer => out += buffer.toString() );
			childProc.on( 'exit', exitCode => exitCode !== 0 ?
				rej( new Error( 'Non 0 exit code' ) ) :
				res( out ) );
		} );
		const listOfVm = output.split( /^-{3,}$/gm )[1];
		const vmProperties = listOfVm.split( /\r?\n/ ).map( ( vm => {
			const [, id, name, state] = vm.match( /^\s*(\S+)\s+(\S+)\s+(\S+)\s*$/gm ) || [];
			// if ( id === '-' || id === '' || isNullOrUndefined( id ) ) {
			// 	throw new Error();
			// }
			this.isNouOrEmpty( id, '', id === '-' );
			this.isNouOrEmpty( [name, state] );
			return new QemuServiceHelper( this.qemuService, id, { appName: name } , this );
		} ) );
		return vmProperties;
	}

	public delete( vmName: string ) {
		this.isNouOrEmpty( vmName );
		this.destroy( vmName );
		return spawn( 'virsh', [ 'undefine', vmName ] );
	}

	// private fetchMetadata( set: string, uri: string ): IAppConfig {
	// 	this.isNouOrEmpty( [set, uri] );
	// 	spawn( 'virsh', ['metadata', `--set ${set}`, `--uri ${uri}`] ).stdout.on( 'data', data => data );
	// 	return ;
	// }

	public async createImage( imgName: string, imgSize: string, format ?: string ) {
		this.isNouOrEmpty( imgName );
		return spawn( 'qemu-img', [
									'create',
									'-f',
									format || 'qcow2',
									imgName,
									imgSize,
								] ).stdout.on( 'data', data => {
									console.log( data );
									return data;

								} );
	}
}
