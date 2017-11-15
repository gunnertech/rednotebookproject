import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { Document } from '../../models/document.model';
import { DocumentService } from '../../providers/document.service';

import { Section } from '../../models/section.model';
import { SectionService } from '../../providers/section.service';


@Component({
  selector: 'page-section-new',
  templateUrl: 'section-new.html'
})
export class SectionNewPage {

	section: Section;
	errorMessage: string;
	document: Document;

  constructor(private navController: NavController, private navParams: NavParams, private documentService: DocumentService, private sectionService: SectionService) {
  	this.document = new Document();
    this.section = new Section();
    this.section.documentId = this.navParams.get('documentId');
  }

  ionViewDidLoad() {
    let sectionId = this.navParams.get('sectionId');

    if(sectionId) {
      this.sectionService.get(sectionId)
        .subscribe(
          section => this.section = section,
          error =>  this.errorMessage = <any>error
        );      
    }

    this.documentService.get(this.section.documentId)
      .subscribe(
        (document) => {this.document = document; this.section.position = this.document.sections.length + 1; },
        error =>  this.errorMessage = <any>error
      );
  }

  saveSection() {
  	this.section.document = this.section.documentId;
  	this.sectionService.save(this.section)
	  	.subscribe(
	  		section => this.navController.pop(),
	  	  error =>  this.errorMessage = <any>error
	  	);
  }

}
