//////////////////////////////////////////////////////////////////////////
// require/import

const D = require('Diagnostics');
const TG = require('TouchGestures');
const R = require('Reactive');
const I = require('Instruction');
const A = require('Animation');
const T = require('Time');
const P = require('Patches');

import { sleep, rotation90, angleBetween2d, distanceBetween2d } from './util';



//////////////////////////////////////////////////////////////////////////
// GameZombie

export class GameZombie {
    constructor(app, game) {
      this.app = app;
      this.game = game;

      this.aniamtionCurrent = 'idle';
      this.animationTransitionDuration = 600;
      this.animationTransitionFastDuration = 100;
      this.animationTransitionCelebrateDuration = 100;

      this.positionDefault = { x: -0.66248, y: 0, z: 0.15829 };
      this.rotationDefault = { x: 0, y: -rotation90(), z: 0 };

      this.moveDuration = 0;
      this.moveDurationToDistance = 11000; //factor at which zombie travels compared to walk cycle animation that's in place

      this.idleToken = null;
      this.walkToken = null;
      this.swingToken = null;
      this.danceToken = null;

      this.idleProgress = R.val(0);
      this.idleDriver = null;
      P.inputs.setScalar('zombieIdleProgress', this.idleProgress);

      this.walkProgress = R.val(0);
      this.walkDriver = null;
      P.inputs.setScalar('zombieWalkProgress', this.walkProgress);

      this.swingProgress = R.val(0);
      this.swingDriver = null;
      P.inputs.setScalar('zombieSwingProgress', this.swingProgress);

      this.danceProgress = R.val(0);
      this.danceDriver = null;
      P.inputs.setScalar('zombieDanceProgress', this.danceProgress);

      this.app.assets['zombieControllerWalk'].transform.x = 1;
      this.app.assets['zombieControllerSwing'].transform.x = 0;
      this.app.assets['zombieControllerDance'].transform.x = 0;

      for(let i = 0; i < this.app.zombieBones.length; i++){
        const id = this.app.zombieBones[i];

        var mixX = this.app.assets['zombieIdle.' + id].transform.x;
        var mixY = this.app.assets['zombieIdle.' + id].transform.y;
        var mixZ = this.app.assets['zombieIdle.' + id].transform.z;
        var mixRX = this.app.assets['zombieIdle.' + id].transform.rotationX;
        var mixRY = this.app.assets['zombieIdle.' + id].transform.rotationY;
        var mixRZ = this.app.assets['zombieIdle.' + id].transform.rotationZ;        

        mixX = R.mix(mixX, this.app.assets['zombieWalk.' + id].transform.x, this.app.assets['zombieControllerWalk'].transform.x);
        mixY = R.mix(mixY, this.app.assets['zombieWalk.' + id].transform.y, this.app.assets['zombieControllerWalk'].transform.x);
        mixZ = R.mix(mixZ, this.app.assets['zombieWalk.' + id].transform.z, this.app.assets['zombieControllerWalk'].transform.x);
        mixRX = R.mix(mixRX, this.app.assets['zombieWalk.' + id].transform.rotationX, this.app.assets['zombieControllerWalk'].transform.x);
        mixRY = R.mix(mixRY, this.app.assets['zombieWalk.' + id].transform.rotationY, this.app.assets['zombieControllerWalk'].transform.x);
        mixRZ = R.mix(mixRZ, this.app.assets['zombieWalk.' + id].transform.rotationZ, this.app.assets['zombieControllerWalk'].transform.x);

        mixX = R.mix(mixX, this.app.assets['zombieSwing.' + id].transform.x, this.app.assets['zombieControllerSwing'].transform.x);
        mixY = R.mix(mixY, this.app.assets['zombieSwing.' + id].transform.y, this.app.assets['zombieControllerSwing'].transform.x);
        mixZ = R.mix(mixZ, this.app.assets['zombieSwing.' + id].transform.z, this.app.assets['zombieControllerSwing'].transform.x);
        mixRX = R.mix(mixRX, this.app.assets['zombieSwing.' + id].transform.rotationX, this.app.assets['zombieControllerSwing'].transform.x);
        mixRY = R.mix(mixRY, this.app.assets['zombieSwing.' + id].transform.rotationY, this.app.assets['zombieControllerSwing'].transform.x);
        mixRZ = R.mix(mixRZ, this.app.assets['zombieSwing.' + id].transform.rotationZ, this.app.assets['zombieControllerSwing'].transform.x);

        mixX = R.mix(mixX, this.app.assets['zombieDance.' + id].transform.x, this.app.assets['zombieControllerDance'].transform.x);
        mixY = R.mix(mixY, this.app.assets['zombieDance.' + id].transform.y, this.app.assets['zombieControllerDance'].transform.x);
        mixZ = R.mix(mixZ, this.app.assets['zombieDance.' + id].transform.z, this.app.assets['zombieControllerDance'].transform.x);
        mixRX = R.mix(mixRX, this.app.assets['zombieDance.' + id].transform.rotationX, this.app.assets['zombieControllerDance'].transform.x);
        mixRY = R.mix(mixRY, this.app.assets['zombieDance.' + id].transform.rotationY, this.app.assets['zombieControllerDance'].transform.x);
        mixRZ = R.mix(mixRZ, this.app.assets['zombieDance.' + id].transform.rotationZ, this.app.assets['zombieControllerDance'].transform.x);

        this.app.assets['zombieMixed.' + id].transform.x = mixX;
        this.app.assets['zombieMixed.' + id].transform.y = mixY;
        this.app.assets['zombieMixed.' + id].transform.z = mixZ;
        this.app.assets['zombieMixed.' + id].transform.rotationX = mixRX;
        this.app.assets['zombieMixed.' + id].transform.rotationY = mixRY;
        this.app.assets['zombieMixed.' + id].transform.rotationZ = mixRZ;

        this.app.assets['zombieShadowMixed.' + id].transform.x = mixX;
        this.app.assets['zombieShadowMixed.' + id].transform.y = mixY;
        this.app.assets['zombieShadowMixed.' + id].transform.z = mixZ;
        this.app.assets['zombieShadowMixed.' + id].transform.rotationX = mixRX;
        this.app.assets['zombieShadowMixed.' + id].transform.rotationY = mixRY;
        this.app.assets['zombieShadowMixed.' + id].transform.rotationZ = mixRZ;

      }

      //
      this.app.assets['zombieShadow'].transform.x = this.app.assets['zombieMixed.Hips'].transform.x;
      this.app.assets['zombieShadow'].transform.z = this.app.assets['zombieMixed.Hips'].transform.z;

    }

    init(){
      this.app.assets['zombie'].transform.x = this.positionDefault.x;
      this.app.assets['zombie'].transform.y = this.positionDefault.y;
      this.app.assets['zombie'].transform.z = this.positionDefault.z;
      this.app.assets['zombie'].transform.rotationX = this.rotationDefault.x;
      this.app.assets['zombie'].transform.rotationY = this.rotationDefault.y;
      this.app.assets['zombie'].transform.rotationZ = this.rotationDefault.z;

    }

    animate(id){
      this.app.assets['zombie'].hidden = false;

      if(id == 'idle'){
        this.idle();

        var driver = A.timeDriver({durationMilliseconds: this.animationTransitionDuration });
        var sampler = A.samplers.linear(this.app.assets['zombieControllerWalk'].transform.x.pinLastValue(), 0);
        this.app.assets['zombieControllerWalk'].transform.x = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: this.animationTransitionDuration });
        var sampler = A.samplers.linear(this.app.assets['zombieControllerSwing'].transform.x.pinLastValue(), 0);
        this.app.assets['zombieControllerSwing'].transform.x = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: this.animationTransitionDuration });
        var sampler = A.samplers.linear(this.app.assets['zombieControllerDance'].transform.x.pinLastValue(), 0);
        this.app.assets['zombieControllerDance'].transform.x = A.animate(driver, sampler);
        driver.start();        

      }else if(id == 'walk'){
        this.walk();

        var driver = A.timeDriver({durationMilliseconds: this.animationTransitionDuration });
        var sampler = A.samplers.linear(this.app.assets['zombieControllerWalk'].transform.x.pinLastValue(), 1);
        this.app.assets['zombieControllerWalk'].transform.x = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: this.animationTransitionDuration });
        var sampler = A.samplers.linear(this.app.assets['zombieControllerSwing'].transform.x.pinLastValue(), 0);
        this.app.assets['zombieControllerSwing'].transform.x = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: this.animationTransitionDuration });
        var sampler = A.samplers.linear(this.app.assets['zombieControllerDance'].transform.x.pinLastValue(), 0);
        this.app.assets['zombieControllerDance'].transform.x = A.animate(driver, sampler);
        driver.start();

      }else if(id == 'swing'){
        this.swing();

        var driver = A.timeDriver({durationMilliseconds: this.animationTransitionFastDuration });
        var sampler = A.samplers.linear(this.app.assets['zombieControllerWalk'].transform.x.pinLastValue(), 0);
        this.app.assets['zombieControllerWalk'].transform.x = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: this.animationTransitionFastDuration });
        var sampler = A.samplers.linear(this.app.assets['zombieControllerSwing'].transform.x.pinLastValue(), 1);
        this.app.assets['zombieControllerSwing'].transform.x = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: this.animationTransitionFastDuration });
        var sampler = A.samplers.linear(this.app.assets['zombieControllerDance'].transform.x.pinLastValue(), 0);
        this.app.assets['zombieControllerDance'].transform.x = A.animate(driver, sampler);
        driver.start();

      }else if(id == 'celebrate'){
        this.celebrate();

        var driver = A.timeDriver({durationMilliseconds: this.animationTransitionCelebrateDuration });
        var sampler = A.samplers.linear(this.app.assets['zombieControllerWalk'].transform.x.pinLastValue(), 0);
        this.app.assets['zombieControllerWalk'].transform.x = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: this.animationTransitionCelebrateDuration });
        var sampler = A.samplers.linear(this.app.assets['zombieControllerSwing'].transform.x.pinLastValue(), 0);
        this.app.assets['zombieControllerSwing'].transform.x = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: this.animationTransitionCelebrateDuration });
        var sampler = A.samplers.linear(this.app.assets['zombieControllerDance'].transform.x.pinLastValue(), 1);
        this.app.assets['zombieControllerDance'].transform.x = A.animate(driver, sampler);
        driver.start();


      }else if(id == 'dance'){
        this.dance();

        var driver = A.timeDriver({durationMilliseconds: this.animationTransitionFastDuration });
        var sampler = A.samplers.linear(this.app.assets['zombieControllerWalk'].transform.x.pinLastValue(), 0);
        this.app.assets['zombieControllerWalk'].transform.x = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: this.animationTransitionFastDuration });
        var sampler = A.samplers.linear(this.app.assets['zombieControllerSwing'].transform.x.pinLastValue(), 0);
        this.app.assets['zombieControllerSwing'].transform.x = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: this.animationTransitionFastDuration });
        var sampler = A.samplers.linear(this.app.assets['zombieControllerDance'].transform.x.pinLastValue(), 1);
        this.app.assets['zombieControllerDance'].transform.x = A.animate(driver, sampler);
        driver.start();

      }

    }

    async move(toForce = null){
      this.animate('walk');

      const zombie = { x: this.app.assets['zombie'].transform.x.pinLastValue(), y: this.app.assets['zombie'].transform.y.pinLastValue(), z: this.app.assets['zombie'].transform.z.pinLastValue() };
      const brain = { x: this.game.brains[this.game.brainCurrent].brain.transform.x.pinLastValue(), y: this.game.brains[this.game.brainCurrent].brain.transform.y.pinLastValue(), z: this.game.brains[this.game.brainCurrent].brain.transform.z.pinLastValue() };
      const hole = { x: this.app.assets['hole'].transform.x.pinLastValue(), y: this.app.assets['hole'].transform.y.pinLastValue(), z: this.app.assets['hole'].transform.z.pinLastValue() };

      this.app.assets['zombie'].transform.rotationY = -angleBetween2d({ x: brain.x, y: brain.z}, { x: zombie.x, y: zombie.z});

      const distanceBetween = distanceBetween2d({ x: zombie.x, y: zombie.z }, { x: brain.x, y: brain.z });
      this.moveDuration = distanceBetween * this.moveDurationToDistance;

      var driver = A.timeDriver({durationMilliseconds: this.moveDuration });
      var sampler = A.samplers.linear(zombie.x, brain.x);
      this.app.assets['zombie'].transform.x = A.animate(driver, sampler);
      driver.start();

      var driver = A.timeDriver({durationMilliseconds: this.moveDuration });
      var sampler = A.samplers.linear(zombie.z, brain.z);
      this.app.assets['zombie'].transform.z = A.animate(driver, sampler);
      driver.start();

      await sleep(this.moveDuration);

      this.animate('idle');

      this.game.showMeter();

    }

    ////////////////////////////////////////////

    idle(){
      this.idleToken = {};
      this.idleAsync(this.idleToken);

    }    

    async idleAsync(token = {}){
      let cancelled = false;

      token.cancel = () => {
          cancelled = true;
      };            

      if(!cancelled){ 
        this.idleDriver = A.timeDriver({durationMilliseconds: 1000, loopCount: Infinity, mirror: true });
        var sampler = A.samplers.linear(0, 0.15);
        this.idleProgress = A.animate(this.idleDriver, sampler);
        this.idleDriver.start();
        P.inputs.setScalar('zombieIdleProgress', this.idleProgress); 

      }    

    }   

    idleCancel(){
        if(this.idleToken != null){
            this.idleToken.cancel();
        }

    }

    walk(){
      this.walkToken = {};
      this.walkAsync(this.walkToken);

    }    

    async walkAsync(token = {}){
      let cancelled = false;

      token.cancel = () => {
          cancelled = true;
      };            

      if(!cancelled){ 
        this.walkDriver = A.timeDriver({durationMilliseconds: 2000, loopCount: Infinity });
        var sampler = A.samplers.linear(0, 1);
        this.walkProgress = A.animate(this.walkDriver, sampler);
        this.walkDriver.start();
        P.inputs.setScalar('zombieWalkProgress', this.walkProgress); 

      }    

    }   

    walkCancel(){
        if(this.walkToken != null){
            this.walkToken.cancel();
        }

    }

    swing(){
      this.swingToken = {};
      this.swingAsync(this.swingToken);

    }    

    async swingAsync(token = {}){
      let cancelled = false;

      token.cancel = () => {
          cancelled = true;
      };            

      if(!cancelled){ 
        this.swingDriver = A.timeDriver({durationMilliseconds: 3967 });
        var sampler = A.samplers.linear(0, 1);
        this.swingProgress = A.animate(this.swingDriver, sampler);
        this.swingDriver.start();
        P.inputs.setScalar('zombieSwingProgress', this.swingProgress); 

      }    

    }   

    swingCancel(){
        if(this.swingToken != null){
            this.swingToken.cancel();
        }

    }    

    dance(){
      this.danceToken = {};
      this.danceAsync(this.danceToken);

    }    

    async danceAsync(token = {}){
      let cancelled = false;

      token.cancel = () => {
          cancelled = true;
      };            

      if(!cancelled){ 
        this.danceDriver = A.timeDriver({durationMilliseconds: 25000 });
        var sampler = A.samplers.linear(0, 1);
        this.danceProgress = A.animate(this.danceDriver, sampler);
        this.danceDriver.start();
        P.inputs.setScalar('zombieDanceProgress', this.danceProgress); 

      }   

    }   

    danceCancel(){
        if(this.danceToken != null){
            this.danceToken.cancel();
        }

    }

    celebrate(){
      this.celebrateToken = {};
      this.celebrateAsync(this.celebrateToken);

    }    

    async celebrateAsync(token = {}){
      let cancelled = false;

      token.cancel = () => {
          cancelled = true;
      };            

      if(!cancelled){ 
        this.celebrateDriver = A.timeDriver({durationMilliseconds: 1500 });
        var sampler = A.samplers.linear(0, 0.07822);
        this.celebrateProgress = A.animate(this.celebrateDriver, sampler);
        this.celebrateDriver.start();
        P.inputs.setScalar('zombieDanceProgress', this.celebrateProgress); 

      }   

    }   

    celebrateCancel(){
        if(this.celebrateToken != null){
            this.celebrateToken.cancel();
        }

    }    

}
