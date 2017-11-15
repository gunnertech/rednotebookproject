import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Storage } from '@ionic/storage';
import { Settings } from '../app/settings.ts';
import 'rxjs/add/operator/map';
 
@Injectable()
export class Auth {
 
  public token: any;
 
  constructor(public http: Http, public storage: Storage) {
 
  }
 
  checkAuthentication() {
 
    return new Promise((resolve, reject) => {
 
        //Load token if exists
        this.storage.get('token').then((value) => {
 
            this.token = value;
 
            let headers = new Headers();
            headers.append('Authorization', this.token);
 
            this.http.get(`${Settings.API_ENDPOINT}/auth/loggedIn`, {headers: headers})
                .subscribe(res => {
                    resolve(res);
                }, (err) => {
                    reject(err);
                }); 
 
        });         
 
    });
 
  }

  checkSecretToken() {
    return new Promise((resolve, reject) => {
      this.storage.get('secretToken').then((value) => {
        if(value) {
          resolve(value);  
        } else {
          reject("not set");
        }
        
      });
    });
  }

  setSecretToken(token) {
    this.storage.set('secretToken', token);
  }
 
  createAccount(details) {
 
    return new Promise((resolve, reject) => {
 
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
 
        this.http.post(`${Settings.API_ENDPOINT}/auth/signup`, JSON.stringify(details), {headers: headers})
          .subscribe(res => {
            let data = res.json();
            this.token = data.token;
            this.storage.set('token', data.token);
            resolve(data);
 
          }, (err) => {
            console.log(err);
            let jsonErr = JSON.parse(err._body);
            var errorMessage = jsonErr.message || jsonErr.signupMessage;
            if('missing credentials' == errorMessage.toLowerCase()) {
              errorMessage = "Please fill out the form completely";
            }
            err.message = errorMessage;
            reject(err);
          });
 
    });
 
  }
 
  login(credentials){
 
    return new Promise((resolve, reject) => {
 
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
 
        this.http.post(`${Settings.API_ENDPOINT}/auth/login`, JSON.stringify(credentials), {headers: headers})
          .subscribe(res => {
 
            let data = res.json();
            this.token = data.token;
            this.storage.set('token', data.token);
            resolve(data);
 
          }, (err) => {
            reject(err);
          });
 
    });
 
  }
 
  logout(){
    return new Promise((resolve, reject) => {
    
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
    
        this.http.post(`${Settings.API_ENDPOINT}/auth/logout`, "", {headers: headers})
          .subscribe(res => {
            this.token = '';
            this.storage.set('token', '');
    
            resolve();
          }, (err) => {
            this.token = '';
            this.storage.set('token', '');
            this.storage.set('secretToken', '');
            reject(err);
          });
    
    });
  }
 
}
