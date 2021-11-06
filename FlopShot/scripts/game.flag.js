//////////////////////////////////////////////////////////////////////////
// require/import

const D = require('Diagnostics');
const TG = require('TouchGestures');
const R = require('Reactive');
const I = require('Instruction');
const A = require('Animation');
const T = require('Time');
const P = require('Patches');

import { sleep } from './util';



//////////////////////////////////////////////////////////////////////////
// GameFlag

export class GameFlag {
    constructor(app, game) {
      this.app = app;
      this.game = game;
      
      this.flapToken = null;
      this.flapDuration = 200;
      this.flagScale = 2.39333;

    }

    init(){

    }

    show(){
      var driver = A.timeDriver({durationMilliseconds: 800 });
      var sampler = A.samplers.easeOutCubic(0, this.flagScale);
      this.app.assets['hole'].transform.scaleX = this.app.assets['hole'].transform.scaleY = this.app.assets['hole'].transform.scaleZ = A.animate(driver, sampler);
      driver.start();

    }

    hide(){
      var driver = A.timeDriver({durationMilliseconds: 400 });
      var sampler = A.samplers.easeInCubic(this.flagScale, 0);
      this.app.assets['hole'].transform.scaleX = this.app.assets['hole'].transform.scaleY = this.app.assets['hole'].transform.scaleZ = A.animate(driver, sampler);
      driver.start();

    }    

    flap(){
      this.flapCancel();

      //
      this.flapToken = {};
      this.flapAsync(this.flapToken);

    }    

    async flapAsync(token = {}){
      let cancelled = false;

      token.cancel = () => {
          cancelled = true;
      };            

      if(!cancelled){ 
        this.flapMorph('flagMorph02', 1, 0, this.flapDuration);
        this.flapMorph('flagMorph03', 0, 1, this.flapDuration);
      }

      if(!cancelled){ 
        await sleep(this.flapDuration);
      }    

      if(!cancelled){ 
        this.flapMorph('flagMorph03', 1, 0, this.flapDuration);
        this.flapMorph('flagMorph04', 0, 1, this.flapDuration);
      }

      if(!cancelled){ 
        await sleep(this.flapDuration);
      }       

      if(!cancelled){ 
        this.flapMorph('flagMorph04', 1, 0, this.flapDuration);
        this.flapMorph('flagMorph05', 0, 1, this.flapDuration);
      }

      if(!cancelled){ 
        await sleep(this.flapDuration);
      }       

      if(!cancelled){ 
        this.flapMorph('flagMorph05', 1, 0, this.flapDuration);
        this.flapMorph('flagMorph06', 0, 1, this.flapDuration);
      }

      if(!cancelled){ 
        await sleep(this.flapDuration);
      }       

      if(!cancelled){ 
        this.flapMorph('flagMorph06', 1, 0, this.flapDuration);
        this.flapMorph('flagMorph07', 0, 1, this.flapDuration);
      }

      if(!cancelled){ 
        await sleep(this.flapDuration);
      }       

      if(!cancelled){ 
        this.flapMorph('flagMorph07', 1, 0, this.flapDuration);
        this.flapMorph('flagMorph08', 0, 1, this.flapDuration);
      }

      if(!cancelled){ 
        await sleep(this.flapDuration);
      }       

      if(!cancelled){ 
        this.flapMorph('flagMorph08', 1, 0, this.flapDuration);
        this.flapMorph('flagMorph02', 0, 1, this.flapDuration);
      }

      if(!cancelled){ 
        await sleep(this.flapDuration);
      }       

      if(!cancelled){ 
        this.flap();
      }       

    }   

    flapCancel(){
        if(this.flapToken != null){
            this.flapToken.cancel();
        }

    }

    flapMorph(id, from, to){
        const driver = A.timeDriver({durationMilliseconds: this.flapDuration });
        const sampler = A.samplers.linear(from, to);
        const weight = A.animate(driver, sampler);
        driver.start();
        P.inputs.setScalar(id, weight);
        
    }    

}
