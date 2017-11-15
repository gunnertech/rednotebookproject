import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Settings } from '../app/settings.ts';

import { Storage } from '@ionic/storage';

import 'rxjs/add/operator/map';

import { User } from '../models/user.model';


@Injectable()
export class UserService {

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
    if (error instanceof Response) {
      error = error.json();
    }
    return Observable.throw(error);
  }

  get(): Observable<User> {

  	return Observable
			.fromPromise(this.buildHeaders())
  		.switchMap((headers) => this.http.get(`${Settings.API_ENDPOINT}/auth/user`, { headers: headers }))
  		.map(res => <User>res.json())
  		.catch(this.handleError);
  }

  save(user: User): Observable<User> {

    let url = `${Settings.API_ENDPOINT}/auth/user`;

  	return Observable
			.fromPromise(this.buildHeaders())
  		.switchMap((headers) => this.http.put(url, user, { headers: headers }))
  		.map(res => <User>res.json())
  		.catch(this.handleError);

  }

  requestResetToken(email: String): Observable<any> {

    let url = `${Settings.API_ENDPOINT}/auth/user/requestResetToken`;

    return Observable
      .fromPromise(this.buildHeaders())
      .switchMap((headers) => this.http.post(url, {email: email}, { headers: headers }))
      .map(res => <any>res.json())
      .catch(this.handleError);

  }


  resetPassword(email: String, password: String, passwordResetToken: String): Observable<any> {

    let url = `${Settings.API_ENDPOINT}/auth/user/resetPassword`;

    return Observable
      .fromPromise(this.buildHeaders())
      .switchMap((headers) => this.http.post(url, {email: email, password: password, passwordResetToken: passwordResetToken}, { headers: headers }))
      .map(res => <any>res.json())
      .catch(this.handleError);

  }

}
