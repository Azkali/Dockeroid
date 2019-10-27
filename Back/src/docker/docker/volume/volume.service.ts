import { Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';

@Injectable()

export class VolumeService {
	public constructor() {}

	public createVolume( volName: string, path: string ) {
		const newVolume = new Docker.Volume( {
			host: '127.0.0.1',
			port: 3000,
			protocol: 'http'},
			volName );

	}

	public attachVolume(  ) {

	}

	public detachVolume( volName: string ) {

	}

	public removeVolume( volName: string ) {
		
	}
}
