import { Component } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';

import { Observable } from 'rxjs/Rx';

import { Part } from '../../models/part.model';
import { PartService } from '../../providers/part.service';

import { Section } from '../../models/section.model';
import { SectionService } from '../../providers/section.service';

import { Document } from '../../models/document.model';
import { DocumentService } from '../../providers/document.service';

import { UserService } from '../../providers/user.service';
import { User } from '../../models/user.model';

import { Assignment } from '../../models/assignment.model';
import { AssignmentService } from '../../providers/assignment.service';

import { InputService } from '../../providers/input.service';
import { Input } from '../../models/input.model';

import { ResponseService } from '../../providers/response.service';
import { Response } from '../../models/response.model';

import { DocumentEditPage } from '../document-edit/document-edit';
import { SectionNewPage } from '../section-new/section-new';
import { InputEditPage } from '../input-edit/input-edit';

import { Auth } from '../../providers/auth';

import _ from "lodash";



@Component({
  selector: 'page-document-show',
  templateUrl: 'document-show.html'
})
export class DocumentShowPage {

	document: Document;
	errorMessage: string;
  user: User;
  assignment: Assignment;

  constructor(private sanitizer:DomSanitizer, public toastCtrl: ToastController, private navCtrl: NavController, private navParams: NavParams, private partService: PartService, private documentService: DocumentService, private alertCtrl: AlertController, private sectionService: SectionService, private userService: UserService, private assignmentService: AssignmentService, private inputService: InputService, private responseService: ResponseService, public authService: Auth) {
  	this.document = new Document();
    this.user = new User();
    this.assignment = new Assignment();
    this.document._id = this.navParams.get('documentId');
  }

  ionViewDidLoad() {

  }

  ionViewWillEnter() {
    this.fetchData();
  }

  responseValueFor(input: Input) : string {
    if(!this.user.responses) {
      return "";
    } else {
      let response = _.find(this.user.responses, (response) => { return response.input == input._id });
      if(!response) {
        return ""
      }
      return (response.isEncrypted ? response.decryptedValue : response.value);
      
    }
  }

  responseFor(input: Input) : Response {
    if(!this.user.responses) {
      return new Response();
    } else {
      return _.find(this.user.responses, (response) => { return response.input == input._id }) || new Response();
    }
  }

  printDocument() {
    let host = window.location.href.toLowerCase().match(/notebook/) ? 'https://rednotebook.herokuapp.com' : 'http://0.0.0.0:8080';
      this.authService.checkSecretToken()
      .then((res) => {
        window.open(`${host}/api/document/${this.document._id}.pdf?encryptionKey=${res}`, '_system');
      }, (err) => {
        
      });
  }

  fetchData() {
    Observable.forkJoin(
      this.userService.get(),
      this.documentService.get(this.navParams.get('documentId'))
    )
    .subscribe(
      (data) => {
        this.user = data[0];
        this.document = data[1];
        this.assignment = _.find(this.user.assignments, (assignment) => { return assignment.document == this.document._id; });
         
        this.document.sections.forEach((section) => {
          section.inputs.forEach((input) => {
            

            if(input.allowMultipleChoiceSelections) {
              input.responseValue = this.responseValueFor(input).split(",");
            } else {
              input.responseValue = this.responseValueFor(input);  
            }

            section.children.forEach((childSection) => {
              childSection.inputs.forEach((input) => {
                if(input.allowMultipleChoiceSelections) {
                  input.responseValue = this.responseValueFor(input).split(",");
                } else {
                  input.responseValue = this.responseValueFor(input);  
                }

                if(this.responseValueFor(input)) {
                  childSection.forceShow = true;
                }
              });
            });
          });
        });
      },
      (error) => this.errorMessage = <any>error,
      () => console.log("completed")
    );
  }

  loadEditDocument() {
    this.navCtrl.push(DocumentEditPage, {
      documentId: this.document._id
    })
  }

  loadEditSection(sectionId) {
    this.navCtrl.push(SectionNewPage, {
      sectionId: sectionId,
      documentId: this.document._id
    })
  }

  loadSectionNew(documentId: string) {
    this.navCtrl.push(SectionNewPage, {
      documentId: this.document._id
    }) 
  }

  loadInputEdit(sectionId: String, inputId: String = null) {
    this.navCtrl.push(InputEditPage, {
      sectionId: sectionId,
      inputId: inputId
    }) 
  }

  showClonedSection(section: Section) {
    section.forceShow = true;
  }

  saveAssignment() {
    this.assignment.completedAt = this.assignment.completedAt ? null : new Date();
    this.assignmentService.save(this.assignment)
      .subscribe(
        assignment => console.log(assignment),
        error =>  this.errorMessage = <any>error
      );
  }

  saveResponses() {
    // this.presentToast("Form Saved!");

    this.document.sections.forEach((section) => {
      section.inputs.forEach((input) => {
        let response = this.responseFor(input);
        response.value = input.responseValue;
        response.input = input._id;
        response.user = this.user._id;

        this.responseService.save(response)
          .subscribe(
            (res) => {},
            error => {}
          );
      });
    });
  }

  saveResponse(input: Input) {
    // this.presentToast("Form Saved!");
    
    setTimeout( () => {
      let response = this.responseFor(input);
      response.value = input.responseValue;
      response.input = input._id;
      response.user = this.user._id;

      this.responseService.save(response)
        .subscribe(
          (res) => {},
          error => {}
        );
    }, 100);
  }

  sendNotification() {
    this.document.sendNotification = true;
    this.documentService.save(this.document)
      .subscribe(
        res => this.presentNotificationAlert(),
        error =>  this.errorMessage = <any>error
      );
  }

  presentNotificationAlert() {
    let alert = this.alertCtrl.create({
      title: 'Notification Sent!',
      subTitle: 'Your notification was sent.',
      buttons: ['Dismiss']
    });
    alert.present();
  }


  removeDocument() {
  	let confirm = this.alertCtrl.create({
      title: 'Delete this document?',
      message: 'Are you sure? There is no undo.',
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
            this.documentService.delete(this.document)
              .subscribe(
              	res => this.navCtrl.pop(),
                error =>  this.errorMessage = <any>error
              );	
          }
        }
      ]
    });
    confirm.present();

  }

  removeSection(sectionId: String) {
    let confirm = this.alertCtrl.create({
      title: 'Delete this section?',
      message: 'Are you sure? This will also delete all inputs associated with this section. There is no undo.',
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
            this.sectionService.delete(sectionId)
              .subscribe(
                res => this.fetchData(),
                error =>  this.errorMessage = <any>error
              );  
          }
        }
      ]
    });
    confirm.present();

  }

  removeInput(inputId: String) {
    let confirm = this.alertCtrl.create({
      title: 'Delete this input?',
      message: 'Are you sure? This will also delete all data associated with this input. There is no undo.',
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
            this.inputService.delete(inputId)
              .subscribe(
                res => this.fetchData(),
                error =>  this.errorMessage = <any>error
              );  
          }
        }
      ]
    });
    confirm.present();

  }

  presentToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  getBase64(file: File, input: Input) {
    let reader = new FileReader();
    
    reader.readAsDataURL(file);
    
    reader.onload = () => {
      input.responseValue = reader.result;
      this.saveResponse(input);
    }
    
    reader.onerror = (error) => {
      console.log('Error: ', error);
    }
  }

  fileChange(event, input: Input) {
    let fileList: FileList = event.target.files;
    if(fileList.length > 0) {
      let file: File = fileList[0];
      this.getBase64(file, input);
      let formData: FormData = new FormData();

      formData.append('uploadFile', file, file.name);
        
    }
  }

  sanitize(url:string){
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

}
