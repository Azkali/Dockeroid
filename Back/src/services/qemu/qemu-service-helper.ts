import { IAppConfig, IAppHelper } from '../app-interface';
import { QemuService } from './qemu.service';

export class QemuServiceHelper implements IAppHelper<QemuService, IAppConfig, {}> {
	public constructor(
		public readonly relatedService: QemuService,
		public readonly id: string,
		public readonly appConfig: IAppConfig,
		public readonly vm: {} ) {
	}

	public async stop() {
		return this.vm.stop();
	}
	public async status() {
		return this.vm.stats();
	}
}
