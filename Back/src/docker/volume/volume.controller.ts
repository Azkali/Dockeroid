import { Controller, Get } from '@nestjs/common';

@Controller('volume')
export class VolumeController {

	@Get('mount')
	public mountVolume() {

	}
}
