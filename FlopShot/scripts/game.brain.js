//////////////////////////////////////////////////////////////////////////
// require/import

const D = require('Diagnostics');
const TG = require('TouchGestures');
const R = require('Reactive');
const I = require('Instruction');
const A = require('Animation');
const T = require('Time');
const P = require('Patches');

import { sleep, randomFloatBetween, rotate2dRadians, distanceBetween2d, angleBetween2d, getPositionAlongTheLine, rotation90, rotation180, degToRad } from './util';



//////////////////////////////////////////////////////////////////////////
// GameBrain

export class GameBrain {
    constructor(app, game, id) {
      this.app = app;
      this.game = game;
      this.id = id;
      
      this.jumping = true;
      this.jumpToken = null;

      this.moveDurationToDistanceFactor = 1500;
      this.heightMaxDistanceFactor = 0.5;

      this.brain = this.app.assets['brain' + this.id];
      this.brainContainer = this.app.assets['brainContainer' + this.id];
      this.brainContainerWhole = this.app.assets['brainContainerWhole' + this.id];
      this.brainContainerLeft = this.app.assets['brainContainerLeft' + this.id];
      this.brainContainerRight = this.app.assets['brainContainerRight' + this.id];
      this.brainContainerLeftShadow = this.app.assets['brainContainerLeftShadow' + this.id];
      this.brainContainerRightShadow = this.app.assets['brainContainerRightShadow' + this.id];
      this.brainShadow = this.app.assets['brainShadow' + this.id];
      this.brainSplatterEmitter = this.app.assets['brainSplatterEmitter' + this.id];
      this.brainHitEmitter = this.app.assets['brainHitEmitter' + this.id];

      this.showPositionDefault = { x: -0.44004, y: 0, z: 0.02734};
      this.showRotaionDefault = { x: 0, y: 0, z: 0};

      this.meterDistanceToCenterMin = 0.01501;
      this.meterDistanceToCenterMax = 0.06;
      this.meterDistanceToCenterTotal = this.meterDistanceToCenterMax - this.meterDistanceToCenterMin;
      this.brainDistanceToCenterMin = 0.3;
      this.brainDistanceToCenterMax = 0.7;
      this.brainDistanceToCenterTotal = this.brainDistanceToCenterMax - this.brainDistanceToCenterMin;

      this.brainSuccessHitY = 0.1049;
      this.brainSuccessHitYRange = 0.08;
      this.brainSuccessHitYFinal = this.brainSuccessHitY + randomFloatBetween(-this.brainSuccessHitYRange, this.brainSuccessHitYRange);
      this.brainSuccessDropY = 0;
      this.brainSuccessDropDuration = 400;
      this.brainSuccessDropRangeMin = 0.06;
      this.brainSuccessDropRange = 0.12;
      this.brainSuccessDropRotationRange = 3;

      this.stayRotationRange = 5;
      this.stayDistanceTravel = 0.03;

      this.scoreDistanceToCenterFactor = 40000;
      this.scoreDistanceToCenterRange = 0.06;
      this.scoreDistanceToCenterSuccesFactor = 80000;

      this.squishCounter = 0;
      this.squishTotal = 3;

    }

    init(){
      this.jumping = true;
      this.brain.hidden = true;
      this.brain.transform.x = this.showPositionDefault.x;
      this.brain.transform.y = this.showPositionDefault.y;
      this.brain.transform.z = this.showPositionDefault.z;
      this.brain.transform.rotationX = this.showRotaionDefault.x;
      this.brain.transform.rotationY = this.showRotaionDefault.y;
      this.brain.transform.rotationZ = this.showRotaionDefault.z;

      this.brainSplatterEmitter.birthrate = 0; 
      this.brainHitEmitter.birthrate = 0;            
     
    }

    show(){
      this.showCancel();

      //
      this.showToken = {};
      this.showAsync(this.showToken);

    }    

    async showAsync(token = {}){
      let cancelled = false;

      token.cancel = () => {
          cancelled = true;
      };            

      if(!cancelled){ 

        this.brain.transform.x = this.showPositionDefault.x;
        this.brain.transform.y = this.showPositionDefault.y;
        this.brain.transform.z = this.showPositionDefault.z;
        this.brain.transform.rotationZ = 0;

        this.brainContainerWhole.hidden = false;
        this.brainContainerLeft.hidden = true;
        this.brainContainerRight.hidden = true;
        this.brainContainerLeft.transform.rotationX = 0;
        this.brainContainerRight.transform.rotationX = 0;
        this.brainContainerLeft.transform.rotationY = 0;
        this.brainContainerRight.transform.rotationY = 0;

        this.brainContainer.transform.scaleX = this.brainContainer.transform.scaleY = this.brainContainer.transform.scaleZ = 1;        
        this.brainContainerWhole.transform.scaleX = this.brainContainerWhole.transform.scaleY = this.brainContainerWhole.transform.scaleZ = 1;        
        this.brainContainerLeft.transform.scaleX = this.brainContainerLeft.transform.scaleY = this.brainContainerLeft.transform.scaleZ = 1;        
        this.brainContainerRight.transform.scaleX = this.brainContainerRight.transform.scaleY = this.brainContainerRight.transform.scaleZ = 1;        

        this.brainContainerLeftShadow.transform.scaleX = this.brainContainerLeftShadow.transform.scaleY = this.brainContainerLeftShadow.transform.scaleZ = 0;
        this.brainContainerRightShadow.transform.scaleX = this.brainContainerRightShadow.transform.scaleY = this.brainContainerRightShadow.transform.scaleZ = 0;

        const brain = this.showPositionDefault;
        const hole = { x: this.app.assets['hole'].transform.x.pinLastValue(), y: this.app.assets['hole'].transform.y.pinLastValue(), z: this.app.assets['hole'].transform.z.pinLastValue() };

        this.brain.transform.rotationY = -angleBetween2d({ x: hole.x, y: hole.z}, { x: brain.x, y: brain.z});

        this.brain.hidden = false;

        var driver = A.timeDriver({durationMilliseconds: 1000 });
        var sampler = A.samplers.linear(2, 0);
        this.brainContainer.transform.y = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: 100 });
        var sampler = A.samplers.easeOutQuad(this.brainContainer.transform.scaleZ.pinLastValue(), 0.65);
        this.brainContainer.transform.scaleZ = A.animate(driver, sampler);
        driver.start();        

        var driver = A.timeDriver({durationMilliseconds: 100 });
        var sampler = A.samplers.easeOutQuad(this.brainContainer.transform.scaleY.pinLastValue(), 1.1);
        this.brainContainer.transform.scaleY = A.animate(driver, sampler);
        driver.start();                 

      }    

      if(!cancelled){ 
        await sleep(800);
      }    

      if(!cancelled){ 
        var driver = A.timeDriver({durationMilliseconds: 200 });
        var sampler = A.samplers.easeOutBounce(0, 1);
        this.brainShadow.transform.scaleX = this.brainShadow.transform.scaleY = this.brainShadow.transform.scaleZ = A.animate(driver, sampler);
        driver.start();   

      }          

      if(!cancelled){ 
        await sleep(200);
      }    

      if(!cancelled){ 
        this.squish();
        this.brainSplatterEmitter.birthrate = 500;  

        var driver = A.timeDriver({durationMilliseconds: 100 });
        var sampler = A.samplers.easeOutQuad(this.brainContainer.transform.scaleZ.pinLastValue(), 2);
        this.brainContainer.transform.scaleZ = A.animate(driver, sampler);
        driver.start();        

        var driver = A.timeDriver({durationMilliseconds: 100 });
        var sampler = A.samplers.easeOutQuad(this.brainContainer.transform.scaleY.pinLastValue(), 0.5);
        this.brainContainer.transform.scaleY = A.animate(driver, sampler);
        driver.start();    

      }          

      if(!cancelled){ 
        await sleep(100);
      }         

      if(!cancelled){ 
        this.brainSplatterEmitter.birthrate = 0;  
      }         

      if(!cancelled){ 
        await sleep(300);
      }         

      if(!cancelled){ 
        var driver = A.timeDriver({durationMilliseconds: 1500 });
        var sampler = A.samplers.easeOutBounce(this.brainContainer.transform.scaleZ.pinLastValue(), 1);
        this.brainContainer.transform.scaleZ = A.animate(driver, sampler);
        driver.start();  
        

        var driver = A.timeDriver({durationMilliseconds: 1500 });
        var sampler = A.samplers.easeOutElastic(this.brainContainer.transform.scaleY.pinLastValue(), 1);
        this.brainContainer.transform.scaleY = A.animate(driver, sampler);
        driver.start();       

      }

      if(!cancelled && this.game.brainCurrent > 0){
        this.game.showMeter();
      }

      if(!cancelled){ 
        await sleep(1500);
      }        

      if(!cancelled){ 
        this.jump();

      }   

    }   

    showCancel(){
        if(this.showToken != null){
            this.showToken.cancel();
        }

    }    

    hide(){
      this.showCancel();
      this.jumpCancel();
      this.stayCancel();

      this.brainSplatterEmitter.birthrate = 0; 
      this.brainHitEmitter.birthrate = 0;      

      var driver = A.timeDriver({durationMilliseconds: 400 });
      var sampler = A.samplers.easeInQuad(this.brainShadow.transform.scaleY.pinLastValue(), 0);
      this.brainShadow.transform.scaleX = this.brainShadow.transform.scaleY = this.brainShadow.transform.scaleZ = A.animate(driver, sampler);
      driver.start();      

      var driver = A.timeDriver({durationMilliseconds: 400 });
      var sampler = A.samplers.easeInQuad(this.brainContainerWhole.transform.scaleY.pinLastValue(), 0);
      this.brainContainerWhole.transform.scaleX = this.brainContainerWhole.transform.scaleY = this.brainContainerWhole.transform.scaleZ = A.animate(driver, sampler);
      driver.start();      

      var driver = A.timeDriver({durationMilliseconds: 400 });
      var sampler = A.samplers.easeInQuad(this.brainContainerLeft.transform.scaleY.pinLastValue(), 0);
      this.brainContainerLeft.transform.scaleX = this.brainContainerLeft.transform.scaleY = this.brainContainerLeft.transform.scaleZ = A.animate(driver, sampler);
      driver.start();      

      var driver = A.timeDriver({durationMilliseconds: 400 });
      var sampler = A.samplers.easeInQuad(this.brainContainerRight.transform.scaleY.pinLastValue(), 0);
      this.brainContainerRight.transform.scaleX = this.brainContainerRight.transform.scaleY = this.brainContainerRight.transform.scaleZ = A.animate(driver, sampler);
      driver.start();      
      
      var driver = A.timeDriver({durationMilliseconds: 400 });
      var sampler = A.samplers.easeInQuad(this.brainContainerLeftShadow.transform.scaleY.pinLastValue(), 0);
      this.brainContainerLeftShadow.transform.scaleX = this.brainContainerLeftShadow.transform.scaleY = this.brainContainerLeftShadow.transform.scaleZ = A.animate(driver, sampler);
      driver.start();      

      var driver = A.timeDriver({durationMilliseconds: 400 });
      var sampler = A.samplers.easeInQuad(this.brainContainerRightShadow.transform.scaleY.pinLastValue(), 0);
      this.brainContainerRightShadow.transform.scaleX = this.brainContainerRightShadow.transform.scaleY = this.brainContainerRightShadow.transform.scaleZ = A.animate(driver, sampler);
      driver.start();      

    }

    jump(){
      this.jumpCancel();

      //
      this.jumpToken = {};
      this.jumpAsync(this.jumpToken);

    }    

    async jumpAsync(token = {}){
      let cancelled = false;

      token.cancel = () => {
          cancelled = true;
      };            

      if(!cancelled){ 
        var driver = A.timeDriver({durationMilliseconds: 500 });
        var sampler = A.samplers.easeOutQuad(this.brainContainer.transform.y.pinLastValue(), 0.04712);
        this.brainContainer.transform.y = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: 250 });
        var sampler = A.samplers.easeOutQuad(this.brainContainer.transform.scaleZ.pinLastValue(), 0.65);
        this.brainContainer.transform.scaleZ = A.animate(driver, sampler);
        driver.start();        

        var driver = A.timeDriver({durationMilliseconds: 500 });
        var sampler = A.samplers.easeOutQuad(this.brainContainer.transform.scaleY.pinLastValue(), 1.1);
        this.brainContainer.transform.scaleY = A.animate(driver, sampler);
        driver.start();        

        var driver = A.timeDriver({durationMilliseconds: 500 });
        var sampler = A.samplers.easeInOutQuad(this.brainShadow.transform.scaleY.pinLastValue(), 0.5);
        this.brainShadow.transform.scaleX = this.brainShadow.transform.scaleY = this.brainShadow.transform.scaleZ = A.animate(driver, sampler);
        driver.start();             

      }         

      if(!cancelled){ 
          await sleep(250);
      }    

      if(!cancelled){ 
        var driver = A.timeDriver({durationMilliseconds: 250 });
        var sampler = A.samplers.easeOutQuad(this.brainContainer.transform.scaleZ.pinLastValue(), 1);
        this.brainContainer.transform.scaleZ = A.animate(driver, sampler);
        driver.start();    
      }          

      if(!cancelled){ 
        await sleep(250);
      }    

      if(!cancelled){ 
        var driver = A.timeDriver({durationMilliseconds: 500 });
        var sampler = A.samplers.easeOutBounce(this.brainContainer.transform.y.pinLastValue(), 0);
        this.brainContainer.transform.y = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: 500 });
        var sampler = A.samplers.easeOutBounce(this.brainContainer.transform.scaleZ.pinLastValue(), 1.1);
        this.brainContainer.transform.scaleZ = A.animate(driver, sampler);
        driver.start();  

        var driver = A.timeDriver({durationMilliseconds: 700 });
        var sampler = A.samplers.easeOutElastic(this.brainContainer.transform.scaleY.pinLastValue(), 1);
        this.brainContainer.transform.scaleY = A.animate(driver, sampler);
        driver.start();       
        
        var driver = A.timeDriver({durationMilliseconds: 500 });
        var sampler = A.samplers.easeOutQuad(this.brainShadow.transform.scaleY.pinLastValue(), 1);
        this.brainShadow.transform.scaleX = this.brainShadow.transform.scaleY = this.brainShadow.transform.scaleZ = A.animate(driver, sampler);
        driver.start();                     

      }

      if(!cancelled){ 
        await sleep(120);
      }    

      if(!cancelled){ 
        this.squish();
        this.brainSplatterEmitter.birthrate = 200;
      }  

      if(!cancelled){ 
        await sleep(100);
      }        

      if(!cancelled){ 
        this.brainSplatterEmitter.birthrate = 0;
      }         

      if(!cancelled){ 
        await sleep(250);
      }        

      if(!cancelled && this.jumping){ 
        this.jump();

      }   

    }   

    jumpCancel(){
        if(this.jumpToken != null){
            this.jumpToken.cancel();
        }

    }

    async hit(distanceToCenter = 0, rotation = 0){
      this.jumping = false;

      this.success = false;      

      const brain = { x: this.brain.transform.x.pinLastValue(), y: this.brain.transform.y.pinLastValue(), z: this.brain.transform.z.pinLastValue() };
      const hole = { x: this.app.assets['hole'].transform.x.pinLastValue(), y: this.app.assets['hole'].transform.y.pinLastValue(), z: this.app.assets['hole'].transform.z.pinLastValue() };
      let to = hole;

      // if(distanceToCenter <= 0.01501){
      //   //hard
      // }else if(distanceToCenter > 0.01501 && distanceToCenter <= 0.02583){
      //   //light
      // }else if(distanceToCenter > 0.02583){
      //   //miss          
      // }      

      // distanceToCenter = 0.005; //hit
      // distanceToCenter = 0; //exact hit
      // distanceToCenter = 0.03; //miss
      // rotation = 0.2; //force rotation

      rotation = rotation180() + rotation90() + rotation;

      if(distanceToCenter <= this.meterDistanceToCenterMin){
        //exact
        this.success = true;

      }else{
        const perctangeMeter = (distanceToCenter - this.meterDistanceToCenterMin) / this.meterDistanceToCenterTotal;
        const perctangeBrain = this.brainDistanceToCenterMax - (perctangeMeter * this.brainDistanceToCenterTotal);

        const positionAway = getPositionAlongTheLine({ x: brain.x, y: brain.z }, { x: hole.x, y: hole.z }, perctangeBrain);
        const positionAwayRotated = rotate2dRadians(hole.x, hole.z, positionAway.x, positionAway.y, rotation, false);
        to = { x: positionAwayRotated.x, y: 0, z: positionAwayRotated.y };

      }

      const distanceBetween = distanceBetween2d({ x: brain.x, y: brain.z }, { x: to.x, y: to.z });
      this.moveDuration = distanceBetween * this.moveDurationToDistanceFactor;
      const heightMax = distanceBetween * this.heightMaxDistanceFactor;

      // D.log(distanceToCenter)
      // D.log(rotation)
      // D.log(brain)
      // D.log(hole)
      // D.log(to)
      // D.log(this.moveDuration)

      this.app.assets['tester'].transform.x = to.x;
      this.app.assets['tester'].transform.y = to.y;
      this.app.assets['tester'].transform.z = to.z;

      await sleep(1400);

      this.game.sound.play('hit');

      this.brainHitEmitter.birthrate = 600; 

      var driver = A.timeDriver({durationMilliseconds: 100 });
      var sampler = A.samplers.easeInOutQuad(this.brainShadow.transform.scaleY.pinLastValue(), 0);
      this.brainShadow.transform.scaleX = this.brainShadow.transform.scaleY = this.brainShadow.transform.scaleZ = A.animate(driver, sampler);
      driver.start();       

      var driver = A.timeDriver({durationMilliseconds: this.moveDuration });
      var sampler = A.samplers.linear(brain.x, to.x);
      this.brain.transform.x = A.animate(driver, sampler);
      driver.start();

      var driver = A.timeDriver({durationMilliseconds: this.moveDuration / 2 });
      var sampler = A.samplers.easeOutQuad(0, heightMax);
      this.brain.transform.y = A.animate(driver, sampler);
      var driverSub = driver.onCompleted().subscribe(e => {
        let heightEnd = 0;
        if(this.success){
          heightEnd = this.brainSuccessHitYFinal;
        }

        var driver = A.timeDriver({durationMilliseconds: this.moveDuration / 2 });
        var sampler = A.samplers.easeInQuad(heightMax, heightEnd);
        this.brain.transform.y = A.animate(driver, sampler);
        driver.start();   

        if(!this.success){
          var driver = A.timeDriver({durationMilliseconds: this.moveDuration / 2 });
          var sampler = A.samplers.easeInOutQuad(this.brainShadow.transform.scaleY.pinLastValue(), 1);
          this.brainShadow.transform.scaleX = this.brainShadow.transform.scaleY = this.brainShadow.transform.scaleZ = A.animate(driver, sampler);
          driver.start();   
        }
     
        var driver = A.timeDriver({durationMilliseconds: this.moveDuration / 2 });
        var sampler = A.samplers.easeInQuint(this.brainContainer.transform.scaleY.pinLastValue(), 0.7);
        this.brainContainer.transform.scaleY = A.animate(driver, sampler);
        driver.start();        

      });
      driver.start();        

      var driver = A.timeDriver({durationMilliseconds: this.moveDuration });
      var sampler = A.samplers.linear(brain.z, to.z);
      this.brain.transform.z = A.animate(driver, sampler);
      driver.start();      

      if(!this.success){
        let newAngle = -angleBetween2d({ x: hole.x, y: hole.z}, { x: to.x, y: to.z});      
        var driver = A.timeDriver({durationMilliseconds: this.moveDuration });
        var sampler = A.samplers.linear(this.brain.transform.rotationY.pinLastValue(), newAngle);
        this.brain.transform.rotationY = A.animate(driver, sampler);
        driver.start();        
      }

      await sleep(150);

      this.brainHitEmitter.birthrate = 0; 

      await sleep(this.moveDuration - 250);      

      if(this.success){  
        this.game.sound.play('split');

        this.brainContainerWhole.hidden = true;
        this.brainContainerLeft.hidden = false;
        this.brainContainerRight.hidden = false;

        var driver = A.timeDriver({durationMilliseconds: this.brainSuccessDropDuration });
        var sampler = A.samplers.linear(this.brainSuccessHitYFinal, this.brainSuccessDropY);
        this.brain.transform.y = A.animate(driver, sampler);
        driver.start();   

        var driver = A.timeDriver({durationMilliseconds: this.brainSuccessDropDuration });
        var sampler = A.samplers.easeOutQuad(0, -rotation90());
        this.brainContainerLeft.transform.rotationX = A.animate(driver, sampler);
        driver.start();          

        var driver = A.timeDriver({durationMilliseconds: this.brainSuccessDropDuration });
        var sampler = A.samplers.linear(0, this.brainSuccessDropRangeMin + randomFloatBetween(0, this.brainSuccessDropRange));
        this.brainContainerLeft.transform.x = A.animate(driver, sampler);
        driver.start();               

        var driver = A.timeDriver({durationMilliseconds: this.brainSuccessDropDuration });
        var sampler = A.samplers.linear(0, randomFloatBetween(0, -this.brainSuccessDropRange));
        this.brainContainerLeft.transform.z = A.animate(driver, sampler);
        driver.start();               

        var driver = A.timeDriver({durationMilliseconds: this.brainSuccessDropDuration });
        var sampler = A.samplers.easeOutCubic(0, randomFloatBetween(-this.brainSuccessDropRotationRange, this.brainSuccessDropRotationRange));
        this.brainContainerLeft.transform.rotationY = A.animate(driver, sampler);
        driver.start();              

        var driver = A.timeDriver({durationMilliseconds: this.brainSuccessDropDuration });
        var sampler = A.samplers.easeOutQuad(0, rotation90());
        this.brainContainerRight.transform.rotationX = A.animate(driver, sampler);
        driver.start();    
        
        var driver = A.timeDriver({durationMilliseconds: this.brainSuccessDropDuration });
        var sampler = A.samplers.linear(0, this.brainSuccessDropRangeMin + randomFloatBetween(0, this.brainSuccessDropRange));
        this.brainContainerRight.transform.x = A.animate(driver, sampler);
        driver.start();               

        var driver = A.timeDriver({durationMilliseconds: this.brainSuccessDropDuration });
        var sampler = A.samplers.linear(0, randomFloatBetween(0, this.brainSuccessDropRange));
        this.brainContainerRight.transform.z = A.animate(driver, sampler);
        driver.start();               

        var driver = A.timeDriver({durationMilliseconds: this.brainSuccessDropDuration });
        var sampler = A.samplers.easeOutCubic(0, randomFloatBetween(-this.brainSuccessDropRotationRange, this.brainSuccessDropRotationRange));
        this.brainContainerRight.transform.rotationY = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: this.brainSuccessDropDuration });
        var sampler = A.samplers.easeInCubic(0, 0.85);
        this.brainContainerLeftShadow.transform.scaleX = this.brainContainerLeftShadow.transform.scaleY = this.brainContainerLeftShadow.transform.scaleZ = this.brainContainerRightShadow.transform.scaleX = this.brainContainerRightShadow.transform.scaleY = this.brainContainerRightShadow.transform.scaleZ = A.animate(driver, sampler);
        driver.start();           

      }

      var driver = A.timeDriver({durationMilliseconds: 500 });
      var sampler = A.samplers.easeOutElastic(this.brainContainer.transform.scaleY.pinLastValue(), 1);
      this.brainContainer.transform.scaleY = A.animate(driver, sampler);
      driver.start();      

      if(this.success){  
        this.brainHitEmitter.birthrate = 500;   
        this.game.sound.play('drop');
      }else{
        this.brainSplatterEmitter.birthrate = 400;   
        this.game.sound.play('split');
        this.squish();
      }
      
      await sleep(80);

      this.brainSplatterEmitter.birthrate = 0; 
      this.brainHitEmitter.birthrate = 0;

      if(this.success){   
        await sleep(100);
      }

      let scoreDistanceToCenter = this.scoreDistanceToCenterRange - distanceToCenter;

      let scoreDistanceToCenterAdd = scoreDistanceToCenter * this.scoreDistanceToCenterFactor;
      scoreDistanceToCenterAdd = Math.ceil(scoreDistanceToCenterAdd);

      if(this.success){   
        this.game.sound.play('split');

        let scoreSuccessAdd = scoreDistanceToCenter * this.scoreDistanceToCenterSuccesFactor;
        scoreSuccessAdd = Math.ceil(scoreSuccessAdd);

        this.game.score(scoreSuccessAdd + scoreDistanceToCenterAdd, true);

        this.game.brainNext(this.success);

      }else{
        this.game.score(scoreDistanceToCenterAdd, true);

        await sleep(500);

        this.game.brainNext(this.success);

        await sleep(1000);

        this.stay();

      }

    }

    stay(){
      this.jumpCancel();
      this.stayCancel();

      //
      this.stayToken = {};
      this.stayAsync(this.stayToken);

    }    

    async stayAsync(token = {}){
      let cancelled = false;

      token.cancel = () => {
          cancelled = true;
      };            

      if(!cancelled){ 

        const newRotation = this.brain.transform.rotationY.pinLastValue() + randomFloatBetween(-this.stayRotationRange, this.stayRotationRange);
        var driver = A.timeDriver({durationMilliseconds: 700 });
        var sampler = A.samplers.easeInOutQuad(this.brain.transform.rotationY.pinLastValue(), newRotation);
        this.brain.transform.rotationY = A.animate(driver, sampler);
        driver.start();

        const newX = this.brain.transform.x.pinLastValue() + randomFloatBetween(-this.stayDistanceTravel, this.stayDistanceTravel);
        var driver = A.timeDriver({durationMilliseconds: 500 });
        var sampler = A.samplers.linear(this.brain.transform.x.pinLastValue(), newX);
        this.brain.transform.x = A.animate(driver, sampler);
        driver.start();
  
        const newZ = this.brain.transform.z.pinLastValue() + randomFloatBetween(-this.stayDistanceTravel, this.stayDistanceTravel);
        var driver = A.timeDriver({durationMilliseconds: 500 });
        var sampler = A.samplers.linear(this.brain.transform.z.pinLastValue(), newZ);
        this.brain.transform.z = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: 500 });
        var sampler = A.samplers.easeOutQuad(this.brainContainer.transform.y.pinLastValue(), 0.04712);
        this.brainContainer.transform.y = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: 250 });
        var sampler = A.samplers.easeOutQuad(this.brainContainer.transform.scaleZ.pinLastValue(), 0.65);
        this.brainContainer.transform.scaleZ = A.animate(driver, sampler);
        driver.start();        

        var driver = A.timeDriver({durationMilliseconds: 500 });
        var sampler = A.samplers.easeOutQuad(this.brainContainer.transform.scaleY.pinLastValue(), 1.1);
        this.brainContainer.transform.scaleY = A.animate(driver, sampler);
        driver.start();        

        var driver = A.timeDriver({durationMilliseconds: 500 });
        var sampler = A.samplers.easeInOutQuad(this.brainShadow.transform.scaleY.pinLastValue(), 0.5);
        this.brainShadow.transform.scaleX = this.brainShadow.transform.scaleY = this.brainShadow.transform.scaleZ = A.animate(driver, sampler);
        driver.start();             

      }         

      if(!cancelled){ 
          await sleep(250);
      }    

      if(!cancelled){ 
        var driver = A.timeDriver({durationMilliseconds: 250 });
        var sampler = A.samplers.easeOutQuad(this.brainContainer.transform.scaleZ.pinLastValue(), 1);
        this.brainContainer.transform.scaleZ = A.animate(driver, sampler);
        driver.start();    
      }          

      if(!cancelled){ 
        await sleep(250);
      }    

      if(!cancelled){ 
        var driver = A.timeDriver({durationMilliseconds: 500 });
        var sampler = A.samplers.easeOutBounce(this.brainContainer.transform.y.pinLastValue(), 0);
        this.brainContainer.transform.y = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: 500 });
        var sampler = A.samplers.easeOutBounce(this.brainContainer.transform.scaleZ.pinLastValue(), 1.1);
        this.brainContainer.transform.scaleZ = A.animate(driver, sampler);
        driver.start();  

        var driver = A.timeDriver({durationMilliseconds: 700 });
        var sampler = A.samplers.easeOutElastic(this.brainContainer.transform.scaleY.pinLastValue(), 1);
        this.brainContainer.transform.scaleY = A.animate(driver, sampler);
        driver.start();       
        
        var driver = A.timeDriver({durationMilliseconds: 500 });
        var sampler = A.samplers.easeOutQuad(this.brainShadow.transform.scaleY.pinLastValue(), 1);
        this.brainShadow.transform.scaleX = this.brainShadow.transform.scaleY = this.brainShadow.transform.scaleZ = A.animate(driver, sampler);
        driver.start();                     

      }

      if(!cancelled){ 
        await sleep(120);
      }    

      if(!cancelled){ 
        this.brainSplatterEmitter.birthrate = 200;
      }  

      if(!cancelled){ 
        await sleep(100);
      }        

      if(!cancelled){ 
        this.brainSplatterEmitter.birthrate = 0;
      }         

      if(!cancelled){ 
        await sleep(1000);
      }        

      if(!cancelled){ 
        this.stay();

      }   

    }   

    stayCancel(){
        if(this.stayToken != null){
            this.stayToken.cancel();
        }

    }

    squish(){      
      this.game.sound.play('squish' + this.squishCounter);

      this.squishCounter++;
      if(this.squishCounter >= this.squishTotal){
        this.squishCounter = 0;
      }

    }

}

