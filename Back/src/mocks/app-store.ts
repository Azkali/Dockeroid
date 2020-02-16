export interface IAppVersion<TOptions extends {}> {
	version: string;
	image: string;
	options: TOptions;
	mounts: IMountsConfig;
}

export interface IApp<TOptions extends {}> {
	name: string;
	icon: string;
	type: string;
	version: Array<IAppVersion<TOptions>>;
	repository: string;
}

export interface IMountsConfig {
	customMounts: boolean;
	internalMounts: string[];
	userMounts: Array<{
		label: string;
		desc: string;
		target: string;
		required: boolean;
	}>;
}
