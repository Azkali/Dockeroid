import { ContainerStats, Container } from 'dockerode';
import { IAppHelper } from '../app-interface';
import { DockerService, IContainerConfig } from './docker.service';

export class DockerServiceHelper implements IAppHelper<DockerService, IContainerConfig, ContainerStats> {

	public constructor( service: DockerService , id: string , container: Container ) {
		this.relatedService = service;
		this.id = id;
		this.container = container;
	}

	public relatedService: DockerService;

	public id: string;

	public container: Container;

	public async stop() {
		return this.relatedService.stop( this.id ) ;
	}
	public async status() {
		return this.relatedService.status( this.id );
	}
}
