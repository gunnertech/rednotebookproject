import { Component, ViewChild } from '@angular/core';

import { HomePage } from '../home/home';
import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';

import { Tabs, NavParams } from 'ionic-angular';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = HomePage;
  tab2Root: any = AboutPage;
  tab3Root: any = ContactPage;

  @ViewChild('mainTabs') public tabRef: Tabs;

  constructor(private navParams: NavParams) {
		
  }

  ionViewDidEnter() {
  	this.tabRef.select(this.navParams.get('tabNum') || 0);
 	}
}
