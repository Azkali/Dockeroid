export interface IAppConfig {
	name: string;
	version?: string;
}

export interface IAppServiceInterface<
	THelper extends IAppHelper<IAppServiceInterface<THelper, TConfig, TStatus>, TConfig, TStatus>,
	TConfig extends IAppConfig,
	TStatus> {
	start( object: TConfig ): Promise<THelper>;
	stop( id: string ): Promise<void>;
	status( id: string ): Promise<TStatus>;
	get( id: string ): THelper | undefined;
}

export interface IAppHelper<
	TService extends IAppServiceInterface<IAppHelper<TService, TConfig, TStatus>, TConfig, TStatus>,
	TConfig extends IAppConfig,
	TStatus> {
	readonly relatedService: TService;
	readonly id: string;

	stop(): Promise<void>;
	status(): Promise<TStatus>;
}
