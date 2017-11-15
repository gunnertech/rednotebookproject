import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { UserService } from '../../providers/user.service';

import { LoginPage } from '../login/login';


@Component({
  selector: 'page-request-password-reset',
  templateUrl: 'request-password-reset.html'
})
export class RequestPasswordResetPage {

  email: string;
  errorMessage: any;
  passwordResetToken: string;
  password: string;
  submittedEmail: boolean;

  constructor(private userService: UserService, public navCtrl: NavController, public navParams: NavParams) {
    this.submittedEmail = false;
    this.errorMessage = {};
  }

  ionViewDidLoad() {
  }

  requestResetToken() {
    this.errorMessage = {};
    this.userService.requestResetToken(this.email)
    .subscribe(
      (res) => {
        this.submittedEmail = true;
        console.log(res)
      },
      (error) =>  {
        this.submittedEmail = true;
      }
    );
  }

  resetPassword() {
    this.errorMessage = {};
    this.userService.resetPassword(this.email, this.password, this.passwordResetToken)
    .subscribe(
      (res) => {
        this.navCtrl.setRoot(LoginPage);
      },
      (error) =>  {
        this.errorMessage = <any>error;
        console.log(error);
      }
    );
  }    

}
