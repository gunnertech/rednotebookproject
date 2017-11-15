import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import {enableProdMode} from '@angular/core';

import { AppModule } from './app.module';
import { Settings } from './settings.ts';

if(Settings.ENV === 'production') {
  enableProdMode();  
}

platformBrowserDynamic().bootstrapModule(AppModule);