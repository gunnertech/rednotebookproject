import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';

import { Auth } from '../providers/auth';

import { SignupPage } from '../pages/signup/signup';
import { AccountPage } from '../pages/account/account';
import { TabsPage } from '../pages/tabs/tabs';
import { SecretTokenPage } from '../pages/secret-token/secret-token';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage = SignupPage;

  pages = [
    // {title: "Home", component: HomePage, tabNum: 0},
    // {title: "About", component: AboutPage, tabNum: 1},
    // {title: "Contact", component: ContactPage, tabNum: 2},
    // {title: "Contact Raw", component: ContactPage},
    {title: "Log Out", action: 'logout'},
    {title: "Print Notebook", action: 'printNotebook'},
    {title: "Purchase Notebook", action: 'purchaseNotebook'},
    {title: "My Account", component: AccountPage},
  ];

  constructor(platform: Platform, public menuCtrl: MenuController, public authService: Auth) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

  logout() {
    this.authService.logout().then(() => {
      this.nav.setRoot(SignupPage);
    }, (err) => {
      this.nav.setRoot(SignupPage);
      console.log(err);
    });
  }

  printNotebook() {
    // // <a color="secondary" icon-right ion-button small *ngIf="input.responseValue" target="_blank" [href]="">Completed <ion-icon name="document"></ion-icon></a>
    let host = window.location.href.toLowerCase().match(/notebook/) ? 'https://api.rednotebookproject.com' : 'http://0.0.0.0:8080';
    this.authService.checkSecretToken()
    .then((res) => {
      window.open(`${host}/api/notebook/pdf?encryptionKey=${res}`, '_system');
    }, (err) => {
      this.nav.setRoot(SecretTokenPage);
    });
  }

  purchaseNotebook() {
    window.open('http://www.rednotebookproject.com/', '_system');
  }

  openPage(page) {
    this.menuCtrl.close();
    if(page.action) {
      this[page.action]();
    } else if(page.tabNum) {
      this.nav.setRoot(TabsPage, { tabNum: page.tabNum });  
    } else {
      this.nav.push(page.component);
    }
    
  }
}
