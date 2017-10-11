import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GlobalVars } from '../../providers/global-vars';
import {AlertController} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';

@Component({
  selector: 'page-calculator',
  templateUrl: 'calculator.html'
})

export class CalculatorPage 
{

  //Public variables
  public names=[];
  public name;
  public list_price;
  public retail;
  public nett;
  public net_asp;
  public gross_profit;

  isenabled:boolean=false;

  //Private variables
  private profiles = [];
  private trade;
  private settle;
  private rebate;

  // Constructor - load the drop down
  constructor(public navCtrl: NavController,public globals: GlobalVars, private storage: Storage, public events: Events, private alertController: AlertController)
  {
    console.log("Calculator constructor!");
    this.renderView();
    
    // Subscribe to settings page profile add and modify
    // *************************************************
    events.subscribe('profiles:updated', (profile_name,updated_profile) => 
    {
      console.log("Existing profile was updated");
      this.renderView();
    });

    // Subscribe to setting page - profile has been removed
    // ****************************************************
    events.subscribe('profiles:removed', (profile_name) =>
    {
      console.log("A profile was removed!");
      this.renderView();
    });

    // Subscribe to settings page - selected profile has changed
    // *********************************************************
    events.subscribe('selectedProfile:changed', (profile_name) =>
    {
      console.log("A profile was selected!");
      this.renderView();
    });
  }

  // Should prepare the view for any entrance
  // ****************************************
  renderView()
  {
    //Get list of profiles to poulate the drop-down
    this.getProfiles();

    // Get selected profile
    this.name=this.globals.getProfileName();
    console.log("Profile name:"+this.name);

    // Disable/Enable button
    if (this.name)
    {
      this.isenabled=true;
    }
    else
    {
      this.isenabled=false;
    }

    // Clear result fields
    this.nett="";
    this.net_asp="";
    this.gross_profit="";
  }

  // Get all profiles for drop down and populate it
  // **********************************************
  getProfiles()
  {
    this.profiles=[];
    this.names=[];
    console.log("Get all profiles:");
    this.storage.forEach( (value,key,index) =>
    {
      let data = JSON.parse(value);
      console.log("Name:"+data['name']);
      this.profiles.push(data);
      this.names.push(data['name']);
    }).then(value => 
    {
      for (let i in this.profiles)
      {
        console.log("1:",this.profiles[i].name);
        console.log("2:",this.name);
        if (this.profiles[i].name == this.name)
        {
          this.trade=this.profiles[i].trade;
          this.settle=this.profiles[i].settle;
          this.rebate=this.profiles[i].rebate;
        }
      }
    });
  }


  // When a profile is selected
  // **************************
  profileSelect()
  { 
    console.log('Profile has been selected');
    this.isenabled=true;
    console.log("Set profile name..."+this.name);
    this.globals.setProfileName(this.name);
    for(let data of this.profiles)
    {
      if (data.name == this.name)
      {
        this.trade=data.trade;
        this.settle=data.settle;
        this.rebate=data.rebate;
      }
    } 

    this.nett="";
    this.net_asp="";
    this.gross_profit="";
  
    //Trigger event for selected profile
    this.events.publish('selectedProfile:changed',this.name);
  }


  // Calculate button has been pressed
  // *********************************
  logEvent(event)
  {
    console.log('Calculate button pressed!');
    //this.rands = new FormControl('', Validators.compose([Validators.maxLength(30), Validators.pattern('[0-9]*'), Validators.required]));
    console.log(this.list_price);
    console.log(this.retail);
    if ( (!this.retail)||(!this.list_price) || (Number(this.list_price) < 0.01) || (Number(this.retail) < 0.01))
    {
      console.log("******Warning alert*******");
      this.showAlert("Warning","Please enter valid list and retail values!",1);
    }
    else
    {
      let net_trade = (Number(this.list_price)-(Number(this.list_price)*Number(this.trade)/100)).toFixed(2);
      let net_settle = (net_trade-(net_trade*Number(this.settle)/100)).toFixed(2);
      let net_rebate = (net_trade-(net_trade*Number(this.rebate)/100)).toFixed(2);
      let net_final = (net_trade-((net_trade*Number(this.settle)/100)+(net_trade*Number(this.rebate)/100))).toFixed(2);
      let retail_excl = Number(this.retail)/1.14;
      let tmp = (retail_excl-net_trade)*100;
      this.gross_profit=(tmp/retail_excl).toFixed(2); 
      console.log(this.gross_profit);

      //Calculate values
      //let total_discount=(Number(this.trade)+Number(this.settle))/100;
      //console.log(total_discount);
      //this.nett=(Number(this.list_price)-(Number(this.list_price)*total_discount)).toFixed(2);
      //console.log(this.nett);      
      
      //let tmp = this.nett*(Number(this.rebate)/100);
      //this.net_asp = (this.nett-tmp).toFixed(2);
      //console.log(this.net_asp);

      //let retail_excl = Number(this.retail)/1.14;
      //tmp = (retail_excl-this.nett)*100;
      //this.gross_profit=(tmp/retail_excl).toFixed(2); 
      //console.log(this.gross_profit);      
    }

  }

  // Pop-up msg
  // **********
  showAlert(title,msg,but) 
  {
    //buttons 1 - OK
    // 2 - Ok, Cancel
    let alert = this.alertController.create({
        title: title,
        subTitle: msg,
        buttons: ['OK']
    });
    alert.present();
  }
}
