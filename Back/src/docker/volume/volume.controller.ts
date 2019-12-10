import { Controller, Get, Inject, Param, Module } from '@nestjs/common';
import { Logger } from 'winston';
import { VolumeService } from '../docker/volume/volume.service';

@Module( {
	imports: [ VolumeService ],
} )

@Controller( 'volume' )
export class VolumeController {

	public constructor(
		@Inject( 'winston' ) private readonly logger: Logger,
		private readonly volumeService: VolumeService ) { }

	@Get( 'mount' )
	public mount() {
		// return this.volumeService.mountVolume();
	}

	@Get( 'create/:name/:path' )
	public create(
		@Param( 'name' ) name: string,
		@Param( 'path' ) path: string,
	) {
		return this.volumeService.createVolume( name, path );
	}

	@Get( 'remove/:name' )
	public remove(
		@Param( 'name' ) name: string,
	) {
		return this.volumeService.removeVolume( name );
	}

	@Get( 'info/:name' )
	public info(
		@Param( 'name' ) name: string,
	) {
		return this.volumeService.volumeInfos( name );
	}
}
