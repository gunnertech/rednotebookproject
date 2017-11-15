import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Auth } from '../../providers/auth';
import { UserService } from '../../providers/user.service';

import { TabsPage } from '../tabs/tabs';

import { HomePage } from '../home/home';
import { AccountPage } from '../account/account';


@Component({
  selector: 'page-secret-token',
  templateUrl: 'secret-token.html'
})
export class SecretTokenPage {

	secretToken: string;
  errorMessage: string;

  constructor(public userService: UserService, public authService: Auth, public navCtrl: NavController) {}

  saveToken() {
  	this.authService.setSecretToken(this.secretToken);

    this.userService.get()
    .subscribe(
      (user) => {
        console.log(user)
        if(!user.hasValidSubscription) {
          this.navCtrl.setRoot(AccountPage);
        } else {
          this.navCtrl.setRoot(HomePage);
        }
      },
      error =>  this.errorMessage = <any>error
    );
  }

  ionViewDidLoad() {
    console.log('Hello SecretTokenPage Page');
  }

}
