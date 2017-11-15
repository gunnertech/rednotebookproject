import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Settings } from '../app/settings.ts';
import 'rxjs/add/operator/map';

import { Storage } from '@ionic/storage';

import { Notification } from '../models/notification.model';


@Injectable()
export class NotificationService {

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

  get(notificationId: string): Observable<Notification> {

    return Observable
      .fromPromise(this.buildHeaders())
      .switchMap((headers) => this.http.get(`${Settings.API_ENDPOINT}/notification/${notificationId}`, { headers: headers }))
      .map(res => <Notification>res.json())
      .catch(this.handleError);
  }

  save(notification: Notification): Observable<Notification> {

    let url = notification._id ? `${Settings.API_ENDPOINT}/notification/${notification._id}` : `${Settings.API_ENDPOINT}/notification`;

  	return Observable
			.fromPromise(this.buildHeaders())
  		.switchMap((headers) => (notification._id ? this.http.put(url, notification, { headers: headers }) : this.http.post(url, notification, { headers: headers })))
  		.map(res => <Notification>res.json())
  		.catch(this.handleError);

  }

  delete(notification: Notification | any): Observable<any> {

    return Observable
      .fromPromise(this.buildHeaders())
      .switchMap((headers) => this.http.delete(`${Settings.API_ENDPOINT}/notification/${(notification._id || notification)}`, { headers: headers }) )
      .map(res => <any>res.json())
      .catch(this.handleError);

  }

}
