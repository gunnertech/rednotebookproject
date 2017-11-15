import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { Storage } from '@ionic/storage';

import { Assignment } from '../models/assignment.model';
import { Settings } from '../app/settings.ts';


@Injectable()
export class AssignmentService {

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

  get(assignmentId: string): Observable<Assignment> {

    return Observable
      .fromPromise(this.buildHeaders())
      .switchMap((headers) => this.http.get(`${Settings.API_ENDPOINT}/assignment/${assignmentId}`, { headers: headers }))
      .map(res => <Assignment>res.json())
      .catch(this.handleError);
  }

  save(assignment: Assignment): Observable<Assignment> {

    let url = assignment._id ? `${Settings.API_ENDPOINT}/assignment/${assignment._id}` : `${Settings.API_ENDPOINT}/assignment`;

  	return Observable
			.fromPromise(this.buildHeaders())
  		.switchMap((headers) => (assignment._id ? this.http.put(url, assignment, { headers: headers }) : this.http.post(url, assignment, { headers: headers })))
  		.map(res => <Assignment>res.json())
  		.catch(this.handleError);

  }

  delete(assignment: Assignment | any): Observable<any> {

    return Observable
      .fromPromise(this.buildHeaders())
      .switchMap((headers) => this.http.delete(`${Settings.API_ENDPOINT}/assignment/${(assignment._id || assignment)}`, { headers: headers }) )
      .map(res => <any>res.json())
      .catch(this.handleError);

  }

}
