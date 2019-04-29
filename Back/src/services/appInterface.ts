export interface IAppInterface<TConfig, THelper extends IAppHelper> {
	start( object: TConfig ): Promise<THelper>;
	stop( id: string ): Promise<void>;
	status( id: string ): Promise<void>;
	get( id: string ): THelper | undefined;
}

export interface IAppHelper {
	readonly relatedService: IAppInterface<any, any>;
	readonly id: string;

	stop(): Promise<void>;
	status(): Promise<void>;
}
