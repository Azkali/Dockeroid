
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

@Injectable()
export class ConfigService {

  private readonly envConfig: { [key: string]: string };

  public constructor( filePath: string ) {
	this.envConfig = dotenv.parse( fs.readFileSync( filePath ) );
  }

  /**
   * Get a repository from a location ( DB, Local_Storage )
   * @param key - The location of the repository
   * @returns The repository location
   */
  public get( key: string ): string {
	  return this.envConfig[key];
  }
}
