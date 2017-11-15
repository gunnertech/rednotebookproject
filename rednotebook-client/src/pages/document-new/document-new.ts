import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { Notebook } from '../../models/notebook.model';
import { NotebookService } from '../../providers/notebook.service';

import { State } from '../../models/state.model';
import { StateService } from '../../providers/state.service';

import { Part } from '../../models/part.model';
import { PartService } from '../../providers/part.service';

import { Document } from '../../models/document.model';
import { DocumentService } from '../../providers/document.service';


@Component({
  selector: 'page-document-new',
  templateUrl: 'document-new.html'
})
export class DocumentNewPage {

  part: Part;
  notebook: Notebook;
  states: State[];
  errorMessage: string;
  document: Document;

  constructor(private navController: NavController, private navParams: NavParams, private notebookService: NotebookService, private partService: PartService, private stateService: StateService, private documentService: DocumentService) {
  	this.document = new Document();
    this.document.partId = this.navParams.get('partId');
    this.notebook = new Notebook();
    this.part = new Part();
  }

  ionViewDidLoad() {
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
      
    this.handlePartChange();

  }

  handlePartChange() {
    this.partService.get(this.document.partId)
      .subscribe(
        (part) => {this.part = part; this.document.position = this.part.documents.length + 1; },
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
