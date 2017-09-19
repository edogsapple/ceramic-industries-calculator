import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GlobalVars } from '../../providers/global-vars';
import {AlertController} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';


@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})

export class SettingsPage 
{
  //Public variables
  names = [];
  public name;
  
  //Private variables
  private profiles = [];
  private trade;
  private settle;
  private rebate;
  private isInputDisabled:boolean;

  private hide_input_name=1;

  // Constructor
  // ***********
  constructor(public navCtrl: NavController,public globals: GlobalVars, private storage: Storage,public events: Events, private alertController: AlertController ) 
  {
    console.log("Settings constructor has been called!");
    this.renderView();
    
    this.isInputDisabled=false;
    
    //Subscribe to settings page - selected profile has changed
    events.subscribe('selectedProfile:changed', (profile_name) =>
    {
      console.log("Handle selected profile change!");
      this.name = profile_name;
      for (let i in this.profiles)
      {
        if (this.profiles[i].name == this.name)
        {
          this.trade=this.profiles[i].trade;
          this.settle=this.profiles[i].settle;
          this.rebate=this.profiles[i].rebate;
        }
      }
    });
  }

  // Should prepare the view for any entrance
  // **************************************** 
  renderView()
  {
    //Check if has been already been set
    this.name=this.globals.getProfileName();

    //Get list of profiles to poulate the drop-down
    // Arrays profiles[] and names[] gets populated
    this.getProfiles();
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
      let found=false;
      for (let i in this.profiles)
      {
        if (this.profiles[i].name == this.name)
        {
          found=true;
          this.name=this.profiles[i].name;
          this.trade=this.profiles[i].trade;
          this.settle=this.profiles[i].settle;
          this.rebate=this.profiles[i].rebate;
        }
      }
      if (found==false)
      {
        this.trade="";
        this.settle="";
        this.rebate="";
      }
    });
  }

  // Create a new profile
  // ********************
  newProfile()
  {
    console.log("Create a new profile");
    this.hide_input_name=0;
    this.name="";
    this.trade="";
    this.settle="";
    this.rebate="";
  }

  // Remove a profile
  // ****************
  delProfile()
  {
    console.log("remove profile - ",this.name);
    let theKey=this.name;
    this.presentConfirm(theKey);
  }

  // Confirm message - delete profile
  // ********************************
  presentConfirm(theKey) 
  {
  let alert = this.alertController.create({
    title: 'Warning',
    message: 'Do you want to delete the profile '+theKey+'?',
    buttons: [
      {
        text: 'No',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'Yes, delete',
        handler: () => {
          console.log('Delete profile');
          this.storage.remove(theKey);
          // Unset the selected item in the drop down
          this.globals.setProfileName("");
          // Update view
          this.renderView();
    
          //Trigger event for calculate page
          this.events.publish('profiles:removed',theKey);
        }
      }
    ]
  });
  alert.present();
}

  // Save a profile called!
  // **********************
  saveProfile()
  {
    console.log("save a profile");
    //validate
    if ((!this.name)||(!this.trade)||(!this.settle)||(!this.rebate)||
      (Number(this.trade) < 0)||(Number(this.trade) > 100)||
      (Number(this.settle) < 0)||(Number(this.settle) > 100)||
      (Number(this.rebate) < 0)||(Number(this.rebate) > 100))
    {
      console.log("******Warning alert*******");
      this.showAlert("Warning","Please make sure only valid values have been entered!",1);
      return;
    }
    
    let aProfile = {
      name: this.name,
      trade: this.trade,
      settle: this.settle,
      rebate: this.rebate
    };
    console.log("now save it....");

    this.storage.set(aProfile.name, JSON.stringify(aProfile)).then((val)=>
    {
      console.log("READY");
      // Update data in memory
      this.storage.get(aProfile.name).then((val) => 
      {
        let val_obj=JSON.parse(val);
        let found=false;
        for (let i in this.profiles)
        {
          if (this.profiles[i].name == val_obj.name)
          {
            //Existing entry - update
            found=true;
            this.profiles[i].trade=val_obj.trade;
            this.profiles[i].settle=val_obj.settle;
            this.profiles[i].rebate=val_obj.rebate;
          }
        }
        //New entry - add to array
        if (!found)
        {
          this.names.push(val_obj.name);
          this.profiles.push(val_obj);
          found=false;
        }
        //Trigger event for calculate page
        this.events.publish('profiles:updated',val_obj.name,val_obj);
      });
    });    
  }


  // When a profile is selected - change dropdown
  // ********************************************
  profileSelect()  
  {
    console.log("Set profile name..."+this.name);
    this.hide_input_name=1;
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
    //Trigger event for selected profile
    this.events.publish('selectedProfile:changed',this.name);
  }

  // Show error message pop-up
  // *************************
  showAlert(title,msg,but) 
  {
    //buttons 1 - OK
    // 2 - Ok, Cancel
    if (but == 1)
    {
      let alert = this.alertController.create({
          title: title,
          subTitle: msg,
          buttons: ['OK']
      });
      alert.present();
    }
    else
    {
        let alert = this.alertController.create({
          title: title,
          subTitle: msg,
          buttons: ['OK','Cancel']
      });
      alert.present();
    }
  }

  // Enter key to load a profile
  // ***************************
  loadProfile()
  {
    console.log("Load a new profile");
    this.presentPrompt();
  }

  // Present pop-up to enter key
  // ***************************
  presentPrompt() 
  {
    let alert = this.alertController.create({
    title: 'Enter key',
    inputs: [
      {
        name: 'theKey',
        placeholder: 'Key'
      },
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
          console.log('Cancel clicked');
        }
      },
      {
        text: 'Submit',
        handler: data => {
          let valid_key = true;
          if (!data)
          {
            valid_key=false;
            this.showAlert('Error',"Invalid Key",1);
            return false;
          }
          console.log("data:",data.theKey);
          try
          {
            let input = atob(data.theKey);
            if (input) 
            {
              let values = input.split(',');
              console.log(values);
              if (values.length == 4)
              {
                this.name=values[0];
                this.trade=values[1];
                this.settle=values[2];
                this.rebate=values[3];
                this.saveProfile();
              }
              else
              {
                // Invalid key
                valid_key = false;
                this.showAlert('Error',"Invalid Key",1);
                return false;
              }
            } 
            else 
            {
              // Invalid Key
              valid_key=false;
              this.showAlert('Error',"Invalid Key",1);
              return false;
            }
          }
          catch(e)
          {
            valid_key=false;
            this.showAlert('Error',"Invalid Key",1);
            return false;            
          }
        }
      }
    ]
  });
  alert.present();
}

}
