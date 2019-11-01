export interface IAppVersion<TOptions extends {}> {
	version: string;
	image: string;
	description: string;
	releaseDate: Date;
	changelog?: string;
	options: TOptions;
}

export interface IApp<TOptions extends {}> {
	appName: string;
	icon: string;
	type: string;
	versions: Array<IAppVersion<TOptions>>;
	repository?: string | {
		type: 'github' | 'other';
		url: string;
	};
}
