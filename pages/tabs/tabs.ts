import { Component } from '@angular/core';

import { CalculatorPage } from '../calculator/calculator';
import { SettingsPage } from '../settings/settings';

import { GlobalVars } from '../../providers/global-vars';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage 
{

  tab1Root = CalculatorPage;
  tab2Root = SettingsPage;

  constructor(public globals: GlobalVars) 
  {
    console.log("TABS constructor");
    //this.navCtrl.setRoot(this.navCtrl.getActive().component);
    //this.nav.parent;

  }

  onClickCalc()
  {
    console.log("Calc tab clicked!");
  }
  
  onClickSettings()
  {
    console.log("Settings tab clicked!");
    console.log(this);
  }
}
