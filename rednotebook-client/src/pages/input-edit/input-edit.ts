import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

import { Input } from '../../models/input.model';
import { InputService } from '../../providers/input.service';

import { FileService } from '../../providers/file.service';

import { Section } from '../../models/section.model';
import { SectionService } from '../../providers/section.service';

import { Storage } from '@ionic/storage';


@Component({
  selector: 'page-input-edit',
  templateUrl: 'input-edit.html'
})
export class InputEditPage {

	section: Section;
	errorMessage: string;
	input: Input;


  constructor(public toastCtrl: ToastController, private fileService: FileService, private storage: Storage, private navController: NavController, private navParams: NavParams, private inputService: InputService, private sectionService: SectionService) {
  	this.input = new Input();
    this.section = new Section();
    this.input.sectionId = this.navParams.get('sectionId');
  }

  ionViewDidLoad() {
    let inputId = this.navParams.get('inputId');

    if(inputId) {
      console.log("HI JAMES")
      this.inputService.get(inputId)
        .subscribe(
          input => this.input = input,
          error =>  this.errorMessage = <any>error
        );      
    }

    this.sectionService.get(this.input.sectionId)
      .subscribe(
        (section) => {
          this.section = section;
          if(!inputId) {
            this.input.position = section.inputs.length + 1; 
          }
        },
        error =>  this.errorMessage = <any>error
      );      
  }

  presentToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  saveInput() {
  	this.input.section = this.input.sectionId;
  	this.inputService.save(this.input)
	  	.subscribe(
	  		input => this.navController.pop(),
	  	  error =>  this.errorMessage = <any>error
	  	);
  }

  fileChange(event) {
    this.presentToast('Uploading File. Please wait...');
    let fileList: FileList = event.target.files;
    if(fileList.length > 0) {
      let file: File = fileList[0];
      let formData:FormData = new FormData();

      formData.append('uploadFile', file, file.name);

      this.fileService.save(formData)
        .subscribe(
          (data) => {
            this.input.documentUrl = data.location;
            this.presentToast('File Uploaded!');
          },
          error => console.log(error)
        );
        
    }
  }

}
