export interface IAppVersion<TOptions extends {}> {
	version: string;
	image: string;
	options: TOptions;
}

export interface IApp<TOptions extends {}> {
	label: string;
	type: string;
	version: Array<IAppVersion<TOptions>>;
	repository: string;
}