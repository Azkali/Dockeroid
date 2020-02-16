import { Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { writeFileSync } from 'fs';
import { chain, compact, Dictionary, isEmpty, isEqual } from 'lodash';
import { resolve } from 'path';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { first, map, skip, switchMap } from 'rxjs/operators';
import { IApp, IAppVersion } from '../../mocks/app-store';
import { ConfigService } from '../config/config.service';

export interface IRepository {
	url: string;
	label: string;
	updateDate?: Date;
	createDate: Date;
}

export interface IAppWithParams<TOptions extends {}> {
	version: string;
	options: TOptions;
	name: string;
	type: string;
	repository: string;
	image: string;
}

@Injectable()
export class AppStoreService {

	private get repoFile() {
		return resolve( this.configService.get( 'LOCAL_STORAGE' ), 'repository.json' );
	}

	private readonly repoIndexSubject = new BehaviorSubject<Array<IApp<IAppVersion<any>>>>( [] );
	public readonly repoIndex = this.repoIndexSubject.asObservable();

	// private readonly repositories = new BehaviorSubject<IRepository[]>( [] )
	// 	.pipe( switchMap( () => {
	// 		const repositoriesFileContent: IRepository[] = require( this.repoFile );
	// 		const descs = repositoriesFileContent.map( repoDesc =>
	// 			( {
	// 				createDate: new Date(),
	// 				...repoDesc,
	// 				updateDate: new Date(),
	// 			} ) );

	// 		const index = chain( descs )
	// 			.map( desc => {
	// 				if ( desc.url.startsWith( '/' ) ) {
	// 					const repoContent = require( resolve( 'src/mocks', desc.url.slice( 1 ) ) ) as Array<IApp<any>>;
	// 					console.log( repoContent );
	// 					return {
	// 						index: repoContent,
	// 						desc,
	// 					};
	// 				} else {
	// 					throw new Error( 'Not implemented' );
	// 				}
	// 			} ).map( ( { index, desc } ) =>
	// 				index.map( ( indexItem: IApp<any> & {repository?: string} ) => {
	// 					indexItem.repository = desc.label;
	// 					return indexItem as IApp<any> & {repository: string};
	// 				} ) )
	// 			.flatten()
	// 			.value();
	// 		this.repoIndex.next( index );
	// 		return from( [descs] );
	// 	 } ) );

	// private readonly writeRepositoryFile = this.repositories
	// 	.subscribe( reposDescs => {
	// 		writeFileSync( this.repoFile, JSON.stringify( reposDescs, null, 4 ) );
	// 	} );

	public constructor(
		private readonly configService: ConfigService ) {
		this.repoIndexSubject.subscribe( index => index );
		this.repoIndexSubject.next( require( '../../mocks/app-store.json' ) );
	}

	/**
	 * Triggers a refresh of the repository content
	 */
	public update() {
		throw new WsException( 'not implemented yet !' );
	}

	/**
	 * Add a new repository
	 * @param label - Label of the repository
	 * @param url - URL of the repository
	 */
	public addRepo( label: string, url: string ) {
		return this.repoIndexSubject.subscribe( index => index.values );
	}

	/**
	 * Replace a repository by a newer version of it
	 * @param label - Label of the repository
	 * @param url - New URL of the repository
	 */
	public replaceRepo( label: string, url: string ) {
		this.removeRepo( label );
		this.addRepo( label, url );
	}

	/**
	 * Remove a repository
	 * @param label - Label of the repository
	 */
	public removeRepo( label: string ) {
		return this.repoIndexSubject.unsubscribe();
	}

	/**
	 * Retrieve an application
	 * @param name - Name of the app to get
	 * @param version - Version of the app
	 */
	public getApp( name: string, version?: string ) {
		return this.repoIndexSubject
			.pipe(
				first(),
				map( repoIndex => {
					const app = repoIndex.find( repoItem => repoItem.name === name );
					if ( !app ) {
						throw new Error( `Could not find app ${name}` );
					}
					if ( !version ) {
						version = '*';
					}

					const versionsOrdered = app.version
						// Reject non matching versions
						.filter( item => true ) // TODO: Semver matching
						// Order by latest
						.sort( ( v1, v2 ) => 1 ); // TODO: Semver sort
					if ( isEmpty( versionsOrdered ) ) {
						throw new Error( `Could not find matching app version ${name}:${version}` );
					}
					const appWithVersionParams: IAppWithParams<any> = {
						...app,
						...versionsOrdered[0],
					};
					return appWithVersionParams;
				} ) );
	}
}
