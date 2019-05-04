import * as uniqid from 'uniqid';

export abstract class AAppService {
	private readonly _idGenerator = this._genId();

	protected constructor( private readonly name: string ) {}

	private* _genId(): IterableIterator<string> {
		while ( true ) {
			yield uniqid( this.name + '-' );
		}
	}

	protected genId( ) {
		return this._idGenerator.next().value;
	}
}