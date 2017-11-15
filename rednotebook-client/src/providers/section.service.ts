import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Settings } from '../app/settings.ts';
import 'rxjs/add/operator/map';

import { Storage } from '@ionic/storage';

import { Section } from '../models/section.model';


@Injectable()
export class SectionService {

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

  get(sectionId: string): Observable<Section> {

    return Observable
      .fromPromise(this.buildHeaders())
      .switchMap((headers) => this.http.get(`${Settings.API_ENDPOINT}/section/${sectionId}`, { headers: headers }))
      .map(res => <Section>res.json())
      .catch(this.handleError);
  }

  save(section: Section): Observable<Section> {

    let url = section._id ? `${Settings.API_ENDPOINT}/section/${section._id}` : `${Settings.API_ENDPOINT}/section`;

  	return Observable
			.fromPromise(this.buildHeaders())
  		.switchMap((headers) => (section._id ? this.http.put(url, section, { headers: headers }) : this.http.post(url, section, { headers: headers })))
  		.map(res => <Section>res.json())
  		.catch(this.handleError);

  }

  delete(section: Section | any): Observable<any> {

    return Observable
      .fromPromise(this.buildHeaders())
      .switchMap((headers) => this.http.delete(`${Settings.API_ENDPOINT}/section/${(section._id || section)}`, { headers: headers }) )
      .map(res => <any>res.json())
      .catch(this.handleError);

  }

}
