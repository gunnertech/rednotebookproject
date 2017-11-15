import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { Part } from '../../models/part.model';
import { PartService } from '../../providers/part.service';

import { Notebook } from '../../models/notebook.model';
import { NotebookService } from '../../providers/notebook.service';


@Component({
  selector: 'page-part-edit',
  templateUrl: 'part-edit.html'
})
export class PartEditPage {

	part: Part;
	notebook: Notebook;
  errorMessage: string;

  constructor(public navCtrl: NavController, private navParams: NavParams, private partService: PartService, private notebookService: NotebookService) { 
  	this.part = new Part();
  }

  ionViewDidLoad() {
    this.partService.get(this.navParams.get('partId'))
      .subscribe(
      	part => this.part = part,
        error =>  this.errorMessage = <any>error
      );

    this.notebookService.get()
      .subscribe(
      	(notebook) => {this.notebook = notebook; console.log(notebook);},
        error =>  this.errorMessage = <any>error
      );
  }

  savePart() {
  	this.partService.save(this.part)
	  	.subscribe(
	  		part => this.navCtrl.pop(),
	  	  error =>  this.errorMessage = <any>error
	  	);
  }

}
