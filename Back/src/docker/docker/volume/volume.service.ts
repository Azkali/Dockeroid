import { Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';
import { Dictionary } from 'lodash';
import { IAppVersion } from 'src/mocks/app-store';
import { DockerService } from '../docker.service';

@Injectable()

export class VolumeService {
	public constructor( private readonly docker: DockerService ) {}

	public createVolume( volName: string, path: string ) {
		const newVolume = new Docker.Volume( {
			host: '127.0.0.1',
			port: 3000,
			protocol: 'http'},
			                                    volName );
		}

	private mountVolume( mountMap: Dictionary<string>, config: IAppVersion<any>['volumes'] ) {
		const mountSettings = Object.entries( mountMap ).reduce( ( acc, [key, val] ) => {
			if ( !( config.userVolumes.some( volume => volume.target === key )
			&& !( config.internalVolumes.includes( key ) ) )
			&& !config.customVolumes ) {
				throw new Error( `Couldn\'t find volume named ${ key } !` );
			}

			const volumeSetting: Docker.MountSettings = {
				Source: val,
				Target: key,
				Type: 'bind',
			};
			acc.push( volumeSetting );
			return acc ;
		} ,                                [] as Docker.MountSettings[] );
		return mountSettings;
	}

	public detachVolume( volName: string ) { }

	public removeVolume( volName: string ) {

	}
}
