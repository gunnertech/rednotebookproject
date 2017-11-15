import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
import { Auth } from '../../providers/auth';
import { TabsPage } from '../tabs/tabs';
import { HomePage } from '../home/home';
import { SignupPage } from '../signup/signup';
import { SecretTokenPage } from '../secret-token/secret-token';
import { AccountPage } from '../account/account';
import { RequestPasswordResetPage } from '../request-password-reset/request-password-reset';

import { UserService } from '../../providers/user.service';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  email: string;
  password: string;
  loading: any;
  errorMessage: string;

  constructor(private userService: UserService, public navCtrl: NavController, public authService: Auth, public loadingCtrl: LoadingController, public alertCtrl: AlertController) {

  }

  showLoginAlert(message) {
    let alert = this.alertCtrl.create({
      title: 'Whooops...',
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

  login() {
   
		this.showLoader();

    let credentials = {
	    username: this.email,
	    password: this.password
    };

    this.authService.login(credentials)
    .then((result) => {
      this.loading.dismiss();
      this.authService.checkSecretToken()
      .then((res) => {
        this.userService.get()
        .subscribe(
          (user) => {
            if(!user.hasValidSubscription) {
              this.navCtrl.setRoot(AccountPage);
            } else {
              this.navCtrl.setRoot(HomePage);
            }
          },
          error =>  this.errorMessage = <any>error
        );
      }, (err) => {
        this.navCtrl.setRoot(SecretTokenPage);
      });
    }, (err) => {
      this.loading.dismiss();
      this.showLoginAlert("The login or password is incorrect. Please try again.");
    });
   
   }
   
    launchSignup() {
			this.navCtrl.push(SignupPage);
    }

    launchPasswordResetRequest() {
      this.navCtrl.push(RequestPasswordResetPage); 
    }
   
    showLoader() {
   
      this.loading = this.loadingCtrl.create({
        content: 'Authenticating...'
      });
   
	    this.loading.present();
   
    }

}
