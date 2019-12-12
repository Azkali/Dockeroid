import { Injectable, Module } from '@nestjs/common';

import { Volume, MountSettings } from 'dockerode';
import { Dictionary } from 'lodash';

import { IAppVersion, IMountsConfig } from '../../mocks/app-store';
import { DockerService } from '../docker-service/docker.service';

@Injectable()
export class VolumeService {
	public constructor(
		private readonly docker: DockerService ) { }

	public createDockerVolume( volName: string, path: string ) {
		// Full Match making three groups
		// path.match( /^(https?):\/\/|([^\s$.?#:].[^:]*)|:([^:]+)/gm )];
		const [protocol, host, port] = [
			path.match( /^(https?):\/\//gm ) || 'http',
			// TODO: Should modify second regex to match localhost/localIP only
			path.match( /.*\/([^\s$.?#:].[^:]*)/gm ),
			path.match( /.*:([^:]\d+)/gm ),
		];
		const newVolume = new Volume( {
			host,
			port,
			protocol,
		},                                   volName );
		return newVolume;
	}

	public mountVolume( mountMap: Dictionary<string>, config: IAppVersion<any>['mounts'] ) {
		const mountSettings = Object.entries( mountMap ).reduce( ( acc, [key, val] ) => {
			if ( !( config.userMounts.some( volume => volume.target === key )
				&& !( config.internalMounts.includes( key ) ) )
				&& !config.customMounts ) {
				throw new Error( `Couldn\'t find path for volume named ${key} !` );
			}

			const volumeSetting: MountSettings = {
				Source: val,
				Target: key,
				Type: 'bind',
			};
			acc.push( volumeSetting );
			return acc;
		},                                                       [] as MountSettings[] );
		return mountSettings;
	}

	public dockerVolumeInfos( name: string ) {
		// return this.volume.inspect( infos => console.log( infos ) );
	}

	public dockerRemoveVolume( name: string ) {
		// return this.volume.remove( { name } );
	}

	public listVolumes( config: IAppVersion<any>['mounts'] ) {
		return config;
	}

	public detachVolume() {  }
}
