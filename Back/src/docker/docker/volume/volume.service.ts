import { Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';
import { Dictionary } from 'lodash';
import { IAppVersion } from 'src/mocks/app-store';
import { DockerService } from '../docker.service';

@Injectable()
export class VolumeService {
	public constructor( private readonly docker: DockerService ) { }

	public createVolume( volName: string, path: string ) {
		// Full Match making three groups
		// path.match( /^(https?):\/\/|([^\s$.?#:].[^:]*)|:([^:]+)/gm )];
		const [protocol, host, port] = [
			path.match( /^(https?):\/\//gm ) || 'http',
			// TODO: Should modify second regex to match localhost/localIP only
			path.match( /.*\/([^\s$.?#:].[^:]*)/gm ),
			path.match( /.*:([^:]\d+)/gm ),
		];
		const newVolume = new Docker.Volume( {
			host,
			port,
			protocol,
		},                                  volName );
		return newVolume;
	}

	public mountVolume( mountMap: Dictionary<string>, config: IAppVersion<any>['volumes'] ) {
		const mountSettings = Object.entries( mountMap ).reduce( ( acc, [key, val] ) => {
			if ( !( config.userVolumes.some( volume => volume.target === key )
				&& !( config.internalVolumes.includes( key ) ) )
				&& !config.customVolumes ) {
				throw new Error( `Couldn\'t find volume named ${key} !` );
			}

			const volumeSetting: Docker.MountSettings = {
				Source: val,
				Target: key,
				Type: 'bind',
			};
			acc.push( volumeSetting );
			return acc;
		},                                                    [] as Docker.MountSettings[] );
		return mountSettings;
	}

	public volumeInfos( volume: Docker.Volume ) {
		return volume.inspect();
	}

	public removeVolume( volume: Docker.Volume ) {
		return volume.remove();
	}

	public listVolumes( config: IAppVersion<any>['volumes'] ) {
		return config;
	}

	public detachVolume( ) { }
}