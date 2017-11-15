import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
// import { Settings } from '../../app/settings';

import { Auth } from '../../providers/auth';
import { StateService } from '../../providers/state.service';

import { UserService } from '../../providers/user.service';
// import { User } from '../../models/user.model';

import { State } from '../../models/state.model';


// import { TabsPage } from '../tabs/tabs';
import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';
import { RequestPasswordResetPage } from '../request-password-reset/request-password-reset';
import { SecretTokenPage } from '../secret-token/secret-token';
import { AccountPage } from '../account/account';

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {

	email: string;
	password: string;
	username: string;
	loading: any;
	userFormGroup: FormGroup;
	state: string;
	states: State[];
  errorMessage: string;

  constructor(private userService: UserService, private stateService: StateService, private formBuilder: FormBuilder, public navCtrl: NavController, public authService: Auth, public loadingCtrl: LoadingController, public alertCtrl: AlertController) {
  	this.userFormGroup = this.formBuilder.group({
  	  username: ['', [Validators.required, Validators.minLength(4)]],
  	  email: ['', [Validators.required]],
  	  state: ['', [Validators.required]],
  	  password: ['', [Validators.required, Validators.minLength(8)]]
  	});

  	stateService.query()
      .subscribe(
			  states => this.states = states,
        error =>  this.errorMessage = <any>error
  	  )
  }

  ionViewDidLoad() {
    
    this.showLoader();

    //Check if already authenticated
    this.authService.checkAuthentication()
    .then((res) => {
	    console.log("Already authorized");
	    this.loading.dismiss();
      this.authService.checkSecretToken()
      .then((res) => {
        if(res) {
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
        } else {
          this.navCtrl.setRoot(SecretTokenPage);
        }
      }, (err) => {
        this.navCtrl.setRoot(SecretTokenPage);
      })
    }, (err) => {
      console.log("Not already authorized");
      this.loading.dismiss();
    });
  }

  register() {
  	this.showLoader();

  	let details = {
  		email: this.email,
  		password: this.password,
  		username: this.username,
  		state: this.state
  	};

  	this.authService.createAccount(details)
  	.then((result) => {
  		this.loading.dismiss();
      this.showWelcomeAlert();
  	}, (err) => {
  		this.loading.dismiss();
  		this.showLoginAlert(err.message);
  	});
  }

  launchLogin() {
		this.navCtrl.push(LoginPage);
  }

  launchPasswordResetRequest() {
    this.navCtrl.push(RequestPasswordResetPage); 
  }

  showLoginAlert(message) {
    let alert = this.alertCtrl.create({
      title: 'Whooops...',
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

  showWelcomeAlert() {
    let alert = this.alertCtrl.create({
      title: 'Account Created!',
      subTitle: `
      <p>Your account has been created, and you're ready to start filling in your notebook.</p>
       
      <p>When you close this screen, you will be asked for your personal passcode to protect your data.</p>
       
      <p>The top of every page page contains the navigation for your notebook as well as an indicator of how many documents you have left to fill out. Click this at any time to fill in documents that are incomplete. </p>
       
      <p>The mail icon will alert you when you have new notifications. Just click the icon to see all your notifications.</p>
      `,
      buttons: [
        {
          text: "Let's Get Started!",
          handler: data => {
            this.navCtrl.setRoot(SecretTokenPage);
          }
        }
      ]
    });
    alert.present();
  }

  showLoader() {
  	this.loading = this.loadingCtrl.create({
  		content: 'Authenticating...'
  	});

  	this.loading.present();
  }

}
