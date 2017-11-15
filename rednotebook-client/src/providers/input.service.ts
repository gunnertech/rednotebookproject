import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Settings } from '../app/settings.ts';
import 'rxjs/add/operator/map';

import { Storage } from '@ionic/storage';

import { Input } from '../models/input.model';


@Injectable()
export class InputService {

  constructor(public http: Http, private storage: Storage) { }

  private buildHeaders(): Promise<Headers> {
  	return this.storage.get('token')
	  	.then((value) => {

	  		let headers = new Headers();
	  		headers.append('Authorization', value);
        headers.append('Content-Type', 'application/json');

	  		return headers;
	  	})
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

  get(inputId: string): Observable<Input> {

    return Observable
      .fromPromise(this.buildHeaders())
      .switchMap((headers) => this.http.get(`${Settings.API_ENDPOINT}/input/${inputId}`, { headers: headers }))
      .map(res => <Input>res.json())
      .catch(this.handleError);
  }

  save(input: Input): Observable<Input> {

    let url = input._id ? `${Settings.API_ENDPOINT}/input/${input._id}` : `${Settings.API_ENDPOINT}/input`;

  	return Observable
			.fromPromise(this.buildHeaders())
  		.switchMap((headers) => (input._id ? this.http.put(url, input, { headers: headers }) : this.http.post(url, input, { headers: headers })))
  		.map(res => <Input>res.json())
  		.catch(this.handleError);

  }

  delete(input: Input | any): Observable<any> {

    return Observable
      .fromPromise(this.buildHeaders())
      .switchMap((headers) => this.http.delete(`${Settings.API_ENDPOINT}/input/${(input._id || input)}`, { headers: headers }) )
      .map(res => <any>res.json())
      .catch(this.handleError);

  }

}
