import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Settings } from '../app/settings.ts';
import 'rxjs/add/operator/map';

import { State } from '../models/state.model';


@Injectable()
export class StateService {

  constructor(public http: Http) {
    console.log('Hello StateService Provider');
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

  query(): Observable<State[]> {
		return this.http.get(`${Settings.API_ENDPOINT}/state`)
    	.map(res => <State[]>res.json())
    	.catch(this.handleError);
  }

}
