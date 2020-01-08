import { Inject } from '@nestjs/common';
import { Logger } from 'winston';

export class Virsh {

	public constructor(
		@Inject( 'winston' ) private readonly logger: Logger,
	) {}
}
