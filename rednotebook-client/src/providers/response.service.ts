import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Settings } from '../app/settings.ts';
import 'rxjs/add/operator/map';

import { Storage } from '@ionic/storage';

import { Response as ResponseModel } from '../models/response.model';


@Injectable()
export class ResponseService {

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

  get(responseId: string): Observable<ResponseModel> {

    return Observable
      .fromPromise(this.buildHeaders())
      .switchMap((headers) => this.http.get(`${Settings.API_ENDPOINT}/response/${responseId}`, { headers: headers }))
      .map(res => <ResponseModel>res.json())
      .catch(this.handleError);
  }

  save(response: ResponseModel): Observable<ResponseModel> {

    let url = response._id ? `${Settings.API_ENDPOINT}/response/${response._id}` : `${Settings.API_ENDPOINT}/response`;

  	return Observable
			.fromPromise(this.buildHeaders())
  		.switchMap((headers) => (response._id ? this.http.put(url, response, { headers: headers }) : this.http.post(url, response, { headers: headers })))
  		.map(res => <ResponseModel>res.json())
  		.catch(this.handleError);

  }

  delete(response: ResponseModel | any): Observable<any> {

    return Observable
      .fromPromise(this.buildHeaders())
      .switchMap((headers) => this.http.delete(`${Settings.API_ENDPOINT}/response/${(response._id || response)}`, { headers: headers }) )
      .map(res => <any>res.json())
      .catch(this.handleError);

  }

}
