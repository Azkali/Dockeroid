import * as Docker from 'dockerode';
import { IAppHelper, IAppInterface } from '../appInterface';
import { DockerService } from './docker.service';

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
		return this.relatedService.stop( this.id ) ;
	}
	public async status() {
		return this.relatedService.status( this.id );
	}
}
