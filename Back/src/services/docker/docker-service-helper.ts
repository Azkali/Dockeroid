import * as Docker from 'dockerode';
import { IAppHelper, IAppInterface } from '../appInterface';
import { DockerService } from './docker.service';
// import { Docker } from '../../../__mocks__/docker-cli-js';
export class DockerServiceHelper implements IAppHelper {

	public constructor( service: DockerService , id: string , container: Docker.Container ) {
		this.relatedService = service;
		this.id = id;
		this.container = container;
	 }

	public relatedService: IAppInterface<any, any>;

	public id: string;

	public container: Docker.Container;

	public async stop() {
		return this.container.stop( this.id ) ;
	}
	public async status() {
		return void( this.container.stats( this.id ) );
	}
}
