import { Dictionary } from "lodash";
import { Docker } from "__mocks__/docker-cli-js";
import { IVolumesConfig } from "src/mocks/app-store";

export interface IAppConfig {
	appName: string;
	version?: string;
}

export interface IAppServiceInterface<
	THelper extends IAppHelper<IAppServiceInterface<THelper, TConfig, TStatus>, TConfig, TStatus>,
	TConfig extends IAppConfig,
	TStatus> {
	start( appName: string, version?: string ): Promise<THelper>;
	stop( id: string ): Promise<void>;
	status( id: string ): Promise<TStatus>;
	get( id: string ): THelper | undefined;
	list(): Promise<Dictionary<THelper>>;
}

export interface IAppHelper<
	TService extends IAppServiceInterface<IAppHelper<TService, TConfig, TStatus>, TConfig, TStatus>,
	TConfig extends IAppConfig,
	TStatus> {
	readonly relatedService: TService;
	readonly id: string;
	readonly appConfig: TConfig;

	stop(): Promise<void>;
	status(): Promise<TStatus>;
}

export interface IVolumeService {
	public transformAppConfig(config: IVolumesConfig):  ;
}