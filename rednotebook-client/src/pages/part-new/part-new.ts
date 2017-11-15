import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { Part } from '../../models/part.model';
import { Notebook } from '../../models/notebook.model';
import { NotebookService } from '../../providers/notebook.service';
import { PartService } from '../../providers/part.service';

@Component({
  selector: 'page-part-new',
  templateUrl: 'part-new.html'
})
export class PartNewPage {

	part: Part;
	notebook: Notebook;
  errorMessage: string;

  constructor(public navCtrl: NavController, private navParams: NavParams, private notebookService: NotebookService, private partService: PartService) {
  	this.part = new Part();
  	console.log(this.navParams.get('notebookId'));
  	this.part.notebook = this.navParams.get('notebookId');
  	console.log(this.part.notebook);
  }

  ionViewDidLoad() {
    this.notebookService.get()
      .subscribe(
      	(notebook) => {this.notebook = notebook; this.part.position = (notebook.parts.length + 1)},
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
