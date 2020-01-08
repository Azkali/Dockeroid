import { Dictionary } from 'lodash';

export interface IAppConfig {
	appName: string;
	version?: string;
}

export interface IAppServiceInterface<
	THelper extends IAppHelper<IAppServiceInterface<THelper, TConfig, TStatus>, TConfig, TStatus>,
	TConfig extends IAppConfig,
	TStatus> {
	/**
	 * Generic method to start an application
	 */
	start( appName: string, version?: string ): Promise<THelper>;
	/**
	 * Generic method to stop an application
	 */
	stop( id: string ): Promise<void>;
	/**
	 * Generic method to stop an application
	 */
	status( id: string ): Promise<TStatus>;
	/**
	 * Generic method to get infos about an application
	 */
	get( id: string ): THelper | undefined;
	/**
	 * Generic method that lists all applications
	 */
	list(): Promise<Dictionary<THelper>>;
}

export interface IAppHelper<
	TService extends IAppServiceInterface<IAppHelper<TService, TConfig, TStatus>, TConfig, TStatus>,
	TConfig extends IAppConfig,
	TStatus> {
	readonly relatedService: TService;
	readonly id: string;
	readonly appConfig: TConfig;

	/**
	 * Generic method of the helper to stop an application
	 */
	stop(): Promise<void>;
	/**
	 * Generic method of the helper to get the status of an application
	 */
	status(): Promise<TStatus>;
}

// export interface IMountService {
// 	public transformAppConfig( config: IMountsConfig ):  ;
// }
