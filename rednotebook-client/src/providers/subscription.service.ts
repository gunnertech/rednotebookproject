import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Settings } from '../app/settings.ts';
import 'rxjs/add/operator/map';

import { Storage } from '@ionic/storage';

import { Subscription } from '../models/subscription.model';
import { User } from '../models/user.model';


@Injectable()
export class SubscriptionService {

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

  get(subscriptionId: string): Observable<Subscription> {

    return Observable
      .fromPromise(this.buildHeaders())
      .switchMap((headers) => this.http.get(`${Settings.API_ENDPOINT}/subscription/${subscriptionId}`, { headers: headers }))
      .map(res => <Subscription>res.json())
      .catch(this.handleError);
  }

  save(user: User): Observable<Subscription> {

    let url = `${Settings.API_ENDPOINT}/subscription?user_id=${user._id}`;

  	return Observable
			.fromPromise(this.buildHeaders())
  		.switchMap((headers) => this.http.post(url, user, { headers: headers }))
  		.map(res => <Subscription>res.json())
  		.catch(this.handleError);

  }

  delete(subscription: Subscription | any): Observable<any> {

    return Observable
      .fromPromise(this.buildHeaders())
      .switchMap((headers) => this.http.delete(`${Settings.API_ENDPOINT}/subscription/${(subscription._id || subscription)}`, { headers: headers }) )
      .map(res => <Subscription>res.json())
      .catch(this.handleError);

  }

}
