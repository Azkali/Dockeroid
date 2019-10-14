import { spawn } from 'child_process';

export interface IVirtualMachineCreateOptions {
	name: string;
	args: string[];
}

export interface IVirtualMachineStats {}

export class Qemu {

	public constructor() {}

	public start( vmName: string ) {
		spawn( 'virsh', ['start', vmName ] );
	}

	public shutdown( vmName: string ) {
		spawn( 'virsh', ['shutdown', vmName] );
	}

	public destroy( vmName: string ) {
		spawn( 'virsh', ['destroy', vmName] );
	}

	public status( vmName?: string ) {
		spawn( 'virsh', ['list', vmName || ''] );
	}

	public create( options: IVirtualMachineCreateOptions ) {
		spawn( 'virt-install', ['-n', options.name, options.args.map()] );
	}

	public list() {
		spawn( 'virsh', ['list', '--all'] );
	}

	public delete( vmName: string ) {
		this.destroy( vmName );
		spawn( 'virsh', [ 'undefine', vmName ] );
	}
}
