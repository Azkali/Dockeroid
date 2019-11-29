import { MountConfig } from 'dockerode';

export interface IAppVersion<TOptions extends {}> {
	version: string;
	image: string;
	options: TOptions;
	volumes: IVolumesConfig;
}

export interface IApp<TOptions extends {}> {
	appName: string;
	icon: string;
	type: string;
	version: Array<IAppVersion<TOptions>>;
	repository: string;
}

export interface IVolumesConfig {
	customVolumes: boolean;
	internalVolumes: string[];
	userVolumes: Array<{
		label: string;
		desc: string;
		target: string;
		required: boolean;
	}>;
}