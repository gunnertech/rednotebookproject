import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Settings } from '../app/settings.ts';

import { Storage } from '@ionic/storage';

import 'rxjs/add/operator/map';

import { File } from '../models/file.model';


@Injectable()
export class FileService {

  constructor(public http: Http, private storage: Storage) { }

  private buildHeaders(): Promise<Headers> {
    let headers = new Headers();
    
  	return this.storage.get('token')
	  	.then((value) => {
        headers.append('Authorization', value);
        return this.storage.get('secretToken')
	  	})
      .then((value) => {
        headers.append('EncryptionKey', value);
        return headers;
      });
  }

  private handleError (error: Response | any) {
      // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

  get(): Observable<File> {

  	return Observable
			.fromPromise(this.buildHeaders())
  		.switchMap((headers) => this.http.get(`${Settings.API_ENDPOINT}/auth/file`, { headers: headers }))
  		.map(res => <File>res.json())
  		.catch(this.handleError);
  }

  save(formData: FormData): Observable<any> {

    return Observable
      .fromPromise(this.buildHeaders())
      .switchMap((headers) => this.http.post(`${Settings.API_ENDPOINT}/file`, formData, { headers: headers }))
      .map(res => <any>res.json())
      .catch(this.handleError);

  }

}
