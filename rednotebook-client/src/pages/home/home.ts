import { Component } from '@angular/core';

import { NavController, AlertController } from 'ionic-angular';

import { UserService } from '../../providers/user.service';
import { User } from '../../models/user.model';

import { Observable } from 'rxjs/Rx';

import { NotebookService } from '../../providers/notebook.service';
import { Notebook } from '../../models/notebook.model';

import { Part } from '../../models/part.model';
import { PartService } from '../../providers/part.service';

import { Assignment } from '../../models/assignment.model';

import { DocumentNewPage } from '../document-new/document-new';
import { DocumentShowPage } from '../document-show/document-show';
import { PartNewPage } from '../part-new/part-new';
import { PartEditPage } from '../part-edit/part-edit';
import { NotificationIndexPage }  from '../notification-index/notification-index';

import _ from "lodash";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

	user: User;
	notebook: Notebook;
  documents: Array<Document>;
  errorMessage: string;
  assignmentCount: number;
  completedAssignmentCount: number;
  unopenedNotificationCount: number;

  constructor(public navCtrl: NavController, private userService: UserService, public notebookService: NotebookService, private alertCtrl: AlertController, private partService: PartService) {
    this.user = new User();
  }

  ionViewDidLoad() {
  }

  fetchData() {
    Observable.forkJoin(
      this.notebookService.get(),
      this.userService.get()
    )
    .subscribe(
      (data) => {
        this.notebook = data[0];
        this.updateUser(data[1]);

        if(this.user.role != 'admin') {
          this.notebook.parts.forEach((part) => {
            part.documents = _.filter(part.documents, (document) => { 
              document.assignment = _.find(this.user.assignments, (a) => { return (<Assignment> a).document == document._id; });
              return !!document.assignment;
            });
          });
        }
      }
    )
  }


  ionViewWillEnter() {
    this.fetchData();
  }


  updateUser(user: User) {
    this.user = user;
    this.assignmentCount = user.assignments.length;
    this.completedAssignmentCount = _.filter(user.assignments, (assignment) => { return assignment.completedAt != null; } ).length;
    this.unopenedNotificationCount = _.filter(user.notifications, (notification) => { return !notification.openedAt; } ).length;
  }

  removePart(part: Part) {
    let confirm = this.alertCtrl.create({
      title: 'Delete this part?',
      message: 'Are you sure? This will also delete all items associated with this part and there is no undo.',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.partService.delete(part)
              .subscribe(
                (res) => { this.fetchData(); },
                error =>  this.errorMessage = <any>error
              );  
          }
        }
      ]
    });
    confirm.present();

  }

  loadNewDocument(partId: string) {
  	this.navCtrl.push(DocumentNewPage, {
  		partId: partId
  	});
  }

  loadDocumentShow(documentId: string) {
    this.navCtrl.push(DocumentShowPage, {
      documentId: documentId
    });
  }

  loadNotificationIndex() {
    this.navCtrl.push(NotificationIndexPage);
  }

  loadNewPart(notebookId: string) {
    this.navCtrl.push(PartNewPage, {
      notebookId: notebookId
    })
  }

  loadEditPart(partId: string) {
    this.navCtrl.push(PartEditPage, {
      partId: partId
    }) 
  }

  log(phrase) {
  	console.log(phrase);
  }

}
