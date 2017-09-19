import {Injectable} from '@angular/core';

@Injectable()
export class GlobalVars 
{

  // Gobal - all profiles and the selected one
  public profiles=[];
  public selectedProfile;
    
  constructor() 
  {
    console.log("GLOBAL VARS CONSTRUCTOR");
    this.selectedProfile="";
  }

  setProfileName(value) 
  {
    console.log("Set profile name..."+value);
    this.selectedProfile = value;
  }

  getProfileName() 
  {
    console.log(this.selectedProfile);
    return this.selectedProfile;
  }


  // Get the list of profiles as a global
  getProfiles()
  {
    return this.profiles;
  }

  // Set the list of profiles as a global
  setProfiles(profiles)
  {
    this.profiles=profiles;
  }
}

