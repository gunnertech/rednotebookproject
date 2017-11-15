import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Settings } from '../app/settings.ts';
import 'rxjs/add/operator/map';

import { Storage } from '@ionic/storage';

import { Document } from '../models/document.model';


@Injectable()
export class DocumentService {

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

  get(documentId: string): Observable<Document> {

    return Observable
      .fromPromise(this.buildHeaders())
      .switchMap((headers) => this.http.get(`${Settings.API_ENDPOINT}/document/${documentId}`, { headers: headers }))
      .map(res => <Document>res.json())
      .catch(this.handleError);
  }

  save(document: Document): Observable<Document> {

    let url = document._id ? `${Settings.API_ENDPOINT}/document/${document._id}` : `${Settings.API_ENDPOINT}/document`;

  	return Observable
			.fromPromise(this.buildHeaders())
  		.switchMap((headers) => (document._id ? this.http.put(url, document, { headers: headers }) : this.http.post(url, document, { headers: headers })))
  		.map(res => <Document>res.json())
  		.catch(this.handleError);

  }

  delete(document: Document): Observable<any> {

    return Observable
      .fromPromise(this.buildHeaders())
      .switchMap((headers) => this.http.delete(`${Settings.API_ENDPOINT}/document/${document._id}`, { headers: headers }) )
      .map(res => <any>res.json())
      .catch(this.handleError);

  }

}
