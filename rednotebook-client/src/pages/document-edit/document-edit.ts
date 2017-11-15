import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { Notebook } from '../../models/notebook.model';
import { NotebookService } from '../../providers/notebook.service';

import { State } from '../../models/state.model';
import { StateService } from '../../providers/state.service';

import { Document } from '../../models/document.model';
import { DocumentService } from '../../providers/document.service';

@Component({
  selector: 'page-document-edit',
  templateUrl: 'document-edit.html'
})
export class DocumentEditPage {

  constructor(private navController: NavController, private navParams: NavParams, private notebookService: NotebookService, private stateService: StateService, private documentService: DocumentService) {
  	this.document = new Document();
  	this.notebook = new Notebook();
  }

  notebook: Notebook;
  states: State[];
  errorMessage: string;
  document: Document;

  ionViewDidLoad() {
    this.documentService.get(this.navParams.get('documentId'))
      .subscribe(
      	(document) => {
      		this.document = document; 
      		this.document.partId = document.part._id;
      		this.document.stateId = document.state ? document.state._id : null;
      	},
        error =>  this.errorMessage = <any>error
      );

    this.notebookService.get()
      .subscribe(
      	notebook => this.notebook = notebook,
        error =>  this.errorMessage = <any>error
      );

    this.stateService.query()
      .subscribe(
      	states => this.states = states,
        error =>  this.errorMessage = <any>error
      );


  }

  saveDocument() {
  	this.document.part = this.document.partId;
  	this.document.state = this.document.stateId;
  	
  	this.documentService.save(this.document)
	  	.subscribe(
	  		document => this.navController.pop(),
	  	  error =>  this.errorMessage = <any>error
	  	);
  }

}
