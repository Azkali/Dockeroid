import { Dictionary } from 'lodash';

export interface IAppConfig {
	name: string;
	version?: string;
}

export interface IHypervisorService<
	THelper extends IHypervisorInstance<IHypervisorService<THelper, TConfig, TStatus>, TConfig, TStatus>,
	TConfig extends IAppConfig,
	TStatus> {
	/**
	 * start an application on latest version
	 */
	start( name: string ): Promise<THelper>;
	/**
	 * start an application on specified version
	 */
	startWithVersion( name: string, version?: string ): Promise<THelper>;
	/**
	 * stop an application
	 */
	stop( id: string ): Promise<void>;
	/**
	 * stop an application
	 */
	status( id: string ): Promise<TStatus>;
	/**
	 * get infos about an application
	 */
	get( id: string ): THelper | undefined;
	/**
	 * that lists all applications
	 */
	list(): Promise<Dictionary<THelper>>;
	/**
	 * list volumes attached to the app
	 */
	listVolumes( id: string ): any;
	/**
	 * retrieve information of an app on latest version
	 */
	infos( name: string ): any;
	/**
	 * retrieve information of an app on specified version
	 */
	infosWithVersion( name: string, version?: string ): any;
}

/**
 * Applies to only one instance of an app
 */
export interface IHypervisorInstance<
	TService extends IHypervisorService<IHypervisorInstance<TService, TConfig, TStatus>, TConfig, TStatus>,
	TConfig extends IAppConfig,
	TStatus> {
	readonly relatedService: TService;
	readonly id: string;
	readonly appConfig: TConfig;

	/**
	 * stop the application
	 */
	stop(): Promise<void>;
	/**
	 * get the status the application
	 */
	status(): Promise<TStatus>;
}

// export interface IStorageService {
// 	public transformAppConfig( config: IStorageConfig ):  ;
// }
