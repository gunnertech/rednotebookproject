import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { UserService } from '../../providers/user.service';
import { User } from '../../models/user.model';

import { NotificationService } from '../../providers/notification.service';
import { Notification } from '../../models/notification.model';

import { DocumentShowPage } from '../document-show/document-show';

import _ from "lodash";


@Component({
  selector: 'page-notification-index',
  templateUrl: 'notification-index.html'
})
export class NotificationIndexPage {

  user: User;
  errorMessage: string;

  constructor(public navCtrl: NavController, private userService: UserService, private notificationService: NotificationService) {
    this.user = new User();
  }

  ionViewDidLoad() {
  }

  ionViewWillEnter() {

    this.userService.get()
      .subscribe(
        (user) => { this.updateUser(user); },
        error =>  this.errorMessage = <any>error
      );
  }

  updateUser(user: User) {
    this.user = user;
    _.filter(this.user.notifications, (notification) => { return !notification.seenAt }).forEach((notification) => {
    	notification.seenAt = notification.seenAt || new Date();

    	this.notificationService.save(notification)
    	  .subscribe(
    	    notification => { },
    	    error =>  this.errorMessage = <any>error
    	  );
    });
  }

  markAllRead() {
  	_.filter(this.user.notifications, (notification) => { return !notification.openedAt }).forEach((notification) => {
  		notification.openedAt = notification.openedAt || new Date();

  		this.notificationService.save(notification)
  		  .subscribe(
  		    notification => { },
  		    error =>  this.errorMessage = <any>error
  		  );
  	});
  }

  loadDocument(notification: Notification) {
  	notification.openedAt = notification.openedAt || new Date();
  	this.notificationService.save(notification)
  	  .subscribe(
  	    (notification) => { 
  	    	this.navCtrl.push(DocumentShowPage, {
  	    	  documentId: notification.data.id
  	    	});
  	    },
  	    error =>  this.errorMessage = <any>error
  	  );
  }

}
