import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';

import { StateService } from '../../providers/state.service';
import { State } from '../../models/state.model';

import { UserService } from '../../providers/user.service';
import { User } from '../../models/user.model';

import { SubscriptionService } from '../../providers/subscription.service';

import { HomePage } from '../home/home';


@Component({
  selector: 'page-account',
  templateUrl: 'account.html'
})
export class AccountPage {

	user: User;
	states: State[];
	view: String;
  months: string[];
  errorMessage: string;
  submitting: boolean;

  constructor(public toastCtrl: ToastController, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private userService: UserService, private stateService: StateService, private subscriptionService: SubscriptionService) {
  	this.user = new User();
  	this.user.local = {};
    this.user.billingInfo = {};
  	this.view = "credentials";
    this.months = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.submitting = false;
  }

  ionViewDidLoad() {

    Observable.forkJoin(
      this.userService.get(),
      this.stateService.query()
    )
    .subscribe(
      (data) => {
        this.user = data[0];
        this.states = data[1];
        // this.user.state = this.user.states[0];

        if(!this.user.hasValidSubscription) {
          this.showAlert();
        }
    	},
    	error => this.errorMessage = <any>error
    );
  }

  showAlert() {
    let alert = this.alertCtrl.create({
      title: 'Your Account has Expired',
      subTitle: 'In order to access your account, you need to update your subsribtion. Rednotebook is only $2.99 per month.' ,
      buttons: ['OK']
    });
    this.view = 'subscription';
    alert.present();
  }

  showConfirmation() {
    let alert = this.alertCtrl.create({
      title: 'Thank you!',
      subTitle: 'Your subscription has been updated and is now activated.' ,
      buttons: [
        {
          text: "OK",
          handler: data => {
            this.navCtrl.setRoot(HomePage);
          }
        }
      ]
    });
    alert.present();
  }

  saveSubscription() {
  	this.submitting = true;
  	this.subscriptionService.save(this.user)
  	.subscribe(
  	  (data) => {
  	  	this.submitting = false;
  	  	this.showConfirmation()
  	  },
    	(error) => {
    		this.submitting = false;
        console.log(error);
    		this.presentToast("That information is not valid. Please double check and try again.");
    	}
  	);
  }

  saveUser() {
  	this.submitting = true;
  	this.userService.save(this.user)
  	.subscribe(
  	  (user) => {
  	  	this.submitting = false;
  	  	this.presentToast("Your information has been saved!");
  	  },
    	(error) => {
    		this.submitting = false;
    		this.presentToast("Something went wrong. Please try again");
    	}
  	);
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 5000
    });
    toast.present();
  }

}
