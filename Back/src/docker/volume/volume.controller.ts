import { Controller, Get, Inject, Module, Param } from '@nestjs/common';
import { Logger } from 'winston';
import { DockerService } from '../docker-service/docker.service';
import { VolumeService } from './volume.service';

@Module( {
	imports: [ VolumeService ],
} )

@Controller()
export class VolumeController {

	public constructor(
		@Inject( 'winston' ) private readonly logger: Logger,
		private readonly volumeService: VolumeService,
		private readonly dockerService: DockerService ) { }

	@Get()
	public async sayHi() {
		return 'Hi';
	}

	@Get( 'mount' )
	public mount() {
		// return this.volumeService.mountVolume( {},  );
	}

	@Get( 'create/:name/:path' )
	public create(
		@Param( 'name' ) name: string,
		@Param( 'path' ) path: string,
		@Param( 'appId' ) appId: string,
	) {
		if ( this.dockerService.get( appId ) ) {
			return this.volumeService.createDockerVolume( name, path );
		}
		// TODO: Add qemu support
		// else if ( this.qemuService.get( appId ) ) {
		// 	return this.volumeService.createQemuStorage( name, path );
		// }
		throw new Error( `Invalid app-ID : ${appId}` );
	}

	@Get( 'remove/:name' )
	public remove(
		@Param( 'name' ) name: string,
		@Param( 'appId' ) appId: string,
	) {
		if ( this.dockerService.get( appId ) ) {
			return this.volumeService.dockerRemoveVolume( name );
		}
		throw new Error( `Invalid app-ID : ${appId}` );
	}

	@Get( 'info/:name' )
	public info(
		@Param( 'name' ) name: string,
		@Param( 'appId' ) appId: string,
	) {
		if ( this.dockerService.get( appId ) ) {
			return this.volumeService.dockerVolumeInfos( name );
		}
		throw new Error( `Invalid app-ID : ${appId}` );
	}
	@Get( 'list' )
	public list(
		@Param( 'appId' ) appId: string,
	) {
		// return this.volumeService.listVolumes();
	}
}
