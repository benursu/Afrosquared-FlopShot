//////////////////////////////////////////////////////////////////////////
// require/import

const D = require('Diagnostics');
const TG = require('TouchGestures');
const R = require('Reactive');
const I = require('Instruction');
const A = require('Animation');
const T = require('Time');
const P = require('Patches');

import { GameSound } from './game.sound';
import { GameZombie } from './game.zombie';
import { GameBrain } from './game.brain';
import { GameFlag } from './game.flag';
import { sleep, degToRad, radToDeg, rotation360, rotation90, randomIntBetween, randomFloatBetween, angleBetween2d } from './util';



//////////////////////////////////////////////////////////////////////////
// Game

export class Game {
    constructor(app) {
        this.app = app;
        
        //
        this.app.assets['rainSplatterEmitter'].hsvaColorModulationModifier = A.samplers.HSVA([A.samplers.constant(1), A.samplers.constant(1), A.samplers.constant(1), A.samplers.easeInOutQuart(1, 0)]);
        this.app.assets['rainSplatterEmitter'].sizeModifier = A.samplers.linear(0.001, 0.01);
        this.app.assets['rainSplatterEmitter'].birthrate = 80;

        //
        this.mode = 'tracking'; //tracking,intro,playing

        //
        this.brainCurrent = 0;

        //
        this.scoreCurrent = 0;
        this.scoreToken = null;
        this.score(0, false);

        //
        this.meterInstructionUnderstood = false;
        this.meterRotationDriver = null;
        this.meterRange = 83.65645;
        this.meterAttackHard = 0.34;
        this.meterAttackLight = 0.17;
        this.meterMiss = 0.34;
        this.meterDirection = 1;
        this.meterScale = 1.2;
        this.meterOpacity = 0.4;        
        this.meterTapSub = null;
        this.restartTapSub = null;
        this.meterRotationDuration = [1400, 800, 500, 400, 400, 300, 300, 200, 200];

        //
        this.titleShadowOpacity = 0.29;
        this.zombieShadowOpacity = 0.2;
        

    }

    init(){
        this.sound = new GameSound(this.app, this);

        this.zombie = new GameZombie(this.app, this);

        this.brains = [];
        for(let i = 0; i < this.app.brainsTotal; i++){
            const brain = new GameBrain(this.app, this, i);
            this.brains.push(brain);
        }

        this.flag = new GameFlag(this.app, this);
        this.flag.flap();

    }

    front(){

    }

    back(){

    }

    intro(){
        if(this.mode == 'tracking'){
            this.mode = 'intro';
            this.introAsync();
        }

    }

    async introAsync(){
        if(!this.app.debug){
            this.sound.play('title');

            var driver = A.timeDriver({durationMilliseconds: 1800 });
            var sampler = A.samplers.linear(0, this.titleShadowOpacity);
            this.app.assets['titleShadow0Material'].opacity = A.animate(driver, sampler);
            driver.start();        

            for(let i = 0; i < 4; i++){
                const name = 'title' + i;

                var driver = A.timeDriver({durationMilliseconds: 1300 });
                var sampler = A.samplers.easeOutQuad(rotation360() * 3, 0);
                this.app.assets[name].transform.rotationX = A.animate(driver, sampler);
                driver.start();

                var driver = A.timeDriver({durationMilliseconds: 1000 });
                var sampler = A.samplers.easeInOutQuad(0, 1);
                this.app.assets[name].transform.scaleX = this.app.assets[name].transform.scaleY = this.app.assets[name].transform.scaleZ = A.animate(driver, sampler);
                driver.start();    

                await sleep(50);

            }

            await sleep(100);

            var driver = A.timeDriver({durationMilliseconds: 1800 });
            var sampler = A.samplers.linear(0, this.titleShadowOpacity);
            this.app.assets['titleShadow1Material'].opacity = A.animate(driver, sampler);
            driver.start();        

            for(let i = 4; i < 8; i++){
                const name = 'title' + i;

                var driver = A.timeDriver({durationMilliseconds: 1300 });
                var sampler = A.samplers.easeOutCubic(-rotation360() * 3, 0);
                this.app.assets[name].transform.rotationX = A.animate(driver, sampler);
                driver.start();

                var driver = A.timeDriver({durationMilliseconds: 1000 });
                var sampler = A.samplers.easeInOutQuad(0, 1);
                this.app.assets[name].transform.scaleX = this.app.assets[name].transform.scaleY = this.app.assets[name].transform.scaleZ = A.animate(driver, sampler);
                driver.start();    

                await sleep(50);

            }

            await sleep(1400);

            var driver = A.timeDriver({durationMilliseconds: 600 });
            var sampler = A.samplers.easeOutQuad(this.titleShadowOpacity, 0);
            this.app.assets['titleShadow0Material'].opacity = A.animate(driver, sampler);
            driver.start();               

            for(let i = 0; i < 4; i++){
                const name = 'title' + i;

                var driver = A.timeDriver({durationMilliseconds: 600 });
                var sampler = A.samplers.easeOutCubic(0, rotation360() * 3);
                this.app.assets[name].transform.rotationX = A.animate(driver, sampler);
                driver.start();

                var driver = A.timeDriver({durationMilliseconds: 600 });
                var sampler = A.samplers.easeInOutQuad(1, 0);
                this.app.assets[name].transform.scaleX = this.app.assets[name].transform.scaleY = this.app.assets[name].transform.scaleZ = A.animate(driver, sampler);
                driver.start();

                await sleep(20);

            }

            await sleep(100);

            var driver = A.timeDriver({durationMilliseconds: 600 });
            var sampler = A.samplers.easeOutQuad(this.titleShadowOpacity, 0);
            this.app.assets['titleShadow1Material'].opacity = A.animate(driver, sampler);
            driver.start();               

            for(let i = 4; i < 8; i++){
                const name = 'title' + i;

                var driver = A.timeDriver({durationMilliseconds: 600 });
                var sampler = A.samplers.easeOutQuad(0, rotation360() * 3);
                this.app.assets[name].transform.rotationX = A.animate(driver, sampler);
                driver.start();

                var driver = A.timeDriver({durationMilliseconds: 600 });
                var sampler = A.samplers.easeInOutQuad(1, 0);
                this.app.assets[name].transform.scaleX = this.app.assets[name].transform.scaleY = this.app.assets[name].transform.scaleZ = A.animate(driver, sampler);
                driver.start();

                if(i == 6){
                    this.flag.show();
                }

                await sleep(20);

            }        

        }

        if(this.app.debug){
            this.flag.show();
        }

        this.brains[this.brainCurrent].show();

        if(!this.app.debug){
            await sleep(700);
        }

        this.zombie.init();
        this.zombie.move();
        this.sound.play('walk');

        var driver = A.timeDriver({durationMilliseconds: 800 });
        var sampler = A.samplers.linear(0, 1);
        this.app.assets['zombieBodyMaterial'].opacity = this.app.assets['zombieShoeMaterial'].opacity = this.app.assets['zombieClubMaterial'].opacity = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: 800 });
        var sampler = A.samplers.linear(0, this.zombieShadowOpacity);
        this.app.assets['zombieShadowMaterial'].opacity = A.animate(driver, sampler);
        driver.start();        

        await sleep(2000);

        this.showScore();      

    }

    async showScore(){
        var driver = A.timeDriver({durationMilliseconds: 800 });
        var sampler = A.samplers.linear(0, 0.35);
        this.app.assets['scoreBkgMaterial'].opacity = A.animate(driver, sampler);
        driver.start();      

        await sleep(300);

        var driver = A.timeDriver({durationMilliseconds: 800 });
        var sampler = A.samplers.linear(0, 0.7);
        this.app.assets['scoreTextMaterial'].opacity = A.animate(driver, sampler);
        driver.start();  
        
        await sleep(100);

        for(let i = 0; i < this.app.brainsTotal; i++){
            const name = 'scoreBrain' + i + 'Material';

            var driver = A.timeDriver({durationMilliseconds: 800 });
            var sampler = A.samplers.linear(0, 0.65);
            this.app.assets[name].opacity = A.animate(driver, sampler);
            driver.start();

            await sleep(20);

        }

    }

    async hideScore(){
        var driver = A.timeDriver({durationMilliseconds: 400 });
        var sampler = A.samplers.linear(this.app.assets['scoreBkgMaterial'].opacity.pinLastValue(), 0);
        this.app.assets['scoreBkgMaterial'].opacity = A.animate(driver, sampler);
        driver.start();      

        var driver = A.timeDriver({durationMilliseconds: 400 });
        var sampler = A.samplers.linear(this.app.assets['scoreTextMaterial'].opacity.pinLastValue(), 0);
        this.app.assets['scoreTextMaterial'].opacity = A.animate(driver, sampler);
        driver.start();          

        for(let i = 0; i < this.app.brainsTotal; i++){
            const name = 'scoreBrain' + i + 'Material';

            var driver = A.timeDriver({durationMilliseconds: 400 });
            var sampler = A.samplers.linear(this.app.assets[name].opacity.pinLastValue(), 0);
            this.app.assets[name].opacity = A.animate(driver, sampler);
            driver.start();

        }

    }

    async showMeter(){
        this.app.planeTracker.gestureTapRemove();

        this.mode = 'playing';

        var driver = A.timeDriver({durationMilliseconds: 750 });
        var sampler = A.samplers.linear(this.app.assets['meterCircleMaterial'].opacity.pinLastValue(), this.meterOpacity);
        this.app.assets['meterCircleMaterial'].opacity = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: 750 });
        var sampler = A.samplers.linear(this.app.assets['meter'].transform.scaleX.pinLastValue(), this.meterScale);
        this.app.assets['meter'].transform.scaleX = this.app.assets['meter'].transform.scaleY = this.app.assets['meter'].transform.scaleZ = A.animate(driver, sampler);
        driver.start();

        if(this.meterRotationDriver != null){
            this.meterRotationDriver.stop();
        }
        
        this.meterRotationDriver = A.timeDriver({durationMilliseconds: this.meterRotationDuration[this.brainCurrent], loopCount: Infinity });
        if(this.meterDirection == 1){
            this.meterDirection = 0;
            var sampler = A.samplers.linear(0, rotation360());
        }else{
            this.meterDirection = 1;
            var sampler = A.samplers.linear(0, -rotation360());
        }

        this.app.assets['meterRotation'].transform.rotationZ = this.app.assets['meterPlacementRotation'].transform.rotationZ = A.animate(this.meterRotationDriver, sampler);
        this.meterRotationDriver.start();

        const timeMultiplier = randomFloatBetween(1.8, 2.5);
        const timeAdd = randomIntBetween(3000, 10000)
        const rangeMeter = 0.02;
        this.app.assets['meterCircle'].transform.x = R.sin(this.app.time.add(timeAdd).mul(timeMultiplier)).toRange(-rangeMeter, rangeMeter);

        this.distanceToCenter = this.app.assets['meterCircleDistance'].transform.position.distance(this.app.assets['meterCircle'].transform.position);

        await sleep(1000);

        //
        if(this.meterTapSub != null){
            this.meterTapSub.unsubscribe();
        }  

        if(!this.meterInstructionUnderstood){
            this.meterInstructionUnderstood = true;
            I.bind(true, 'tap_to_advance');
        }

        this.meterTapSub = TG.onTap().subscribeWithSnapshot({ 'this.distanceToCenter': this.distanceToCenter, 'this.app.assets[meterCircle].transform.x': this.app.assets['meterCircle'].transform.x, 'this.app.assets[meterPlacementCircle].transform.x': this.app.assets['meterPlacementCircle'].transform.x, 'this.app.assets[meterRotation].transform.rotationZ': this.app.assets['meterRotation'].transform.rotationZ }, (e, snapshots) => {
            if(this.mode == 'playing'){
                this.meterTapSub.unsubscribe();

                this.app.assets['scoreBrain' + this.brainCurrent + 'Material'].opacity = 0.2;

                this.mode = 'swing';

                I.bind(false, 'tap_to_advance');

                if(this.meterRotationDriver != null){
                    this.meterRotationDriver.stop();
                }

                this.app.assets['meterCircle'].transform.x = snapshots['this.app.assets[meterCircle].transform.x'];
                this.app.assets['meterPlacementCircle'].transform.x = snapshots['this.app.assets[meterPlacementCircle].transform.x'];

                this.hideMeter();          
                
                this.zombie.animate('swing');

                this.brains[this.brainCurrent].hit(snapshots['this.distanceToCenter'], snapshots['this.app.assets[meterRotation].transform.rotationZ']);
                        
            }   

        });             

    }

    hideMeter(){
        var driver = A.timeDriver({durationMilliseconds: 300 });
        var sampler = A.samplers.linear(this.app.assets['meterCircleMaterial'].opacity.pinLastValue(), 0);
        this.app.assets['meterCircleMaterial'].opacity = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: 300 });
        var sampler = A.samplers.linear(this.app.assets['meter'].transform.scaleX.pinLastValue(), 0);
        this.app.assets['meter'].transform.scaleX = this.app.assets['meter'].transform.scaleY = this.app.assets['meter'].transform.scaleZ = A.animate(driver, sampler);
        driver.start();      

    } 

    async brainNext(success = false){
        this.brainCurrent++;
        if(this.brainCurrent < this.app.brainsTotal){
            if(success){
                this.zombie.animate('celebrate');
                this.sound.play('success');
                await sleep(500);         
            }else{
                this.sound.play('failure');
            }

            this.brains[this.brainCurrent].show();

            await sleep(1000);

            this.zombie.animate('idle');


        }else{
            //dinner complete, no more brains
            this.zombie.animate('dance');
            this.sound.play('success');
            this.sound.play('dance');

            await sleep(2000);

            I.bind(true, 'tap_to_reply');
                
            this.meterTapSub = TG.onTap().subscribeWithSnapshot({ 'this.distanceToCenter': this.distanceToCenter, 'this.app.assets[meterCircle].transform.x': this.app.assets['meterCircle'].transform.x, 'this.app.assets[meterPlacementCircle].transform.x': this.app.assets['meterPlacementCircle'].transform.x, 'this.app.assets[meterRotation].transform.rotationZ': this.app.assets['meterRotation'].transform.rotationZ }, (e, snapshots) => {                
                this.meterTapSub.unsubscribe();
                I.bind(false, 'tap_to_reply');
                this.restart();

            });    

        }

    }

    async restart(){
        this.flag.hide();

        this.hideScore();

        var driver = A.timeDriver({durationMilliseconds: 400 });
        var sampler = A.samplers.linear(1, 0);
        this.app.assets['zombieBodyMaterial'].opacity = this.app.assets['zombieShoeMaterial'].opacity = this.app.assets['zombieClubMaterial'].opacity = A.animate(driver, sampler);
        driver.start();

        var driver = A.timeDriver({durationMilliseconds: 400 });
        var sampler = A.samplers.linear(this.zombieShadowOpacity, 0);
        this.app.assets['zombieShadowMaterial'].opacity = A.animate(driver, sampler);
        driver.start();        

        for(let i = 0; i < this.app.brainsTotal; i++){
            this.brains[i].hide();
        }

        await sleep(600);

        this.brainCurrent = 0;        
        this.scoreCurrent = 0;        
        this.score(0, false);
        
        this.zombie.init();
        for(let i = 0; i < this.app.brainsTotal; i++){
            this.brains[i].init();
        }

        this.mode = 'tracking';

        this.zombie.animate('walk');

        this.intro();

    }

    score(add = 0, animate = true){
        this.scoreCancel();

        this.scoreCurrent += add;

        //
        this.scoreToken = {};
        this.scoreAsync(this.scoreToken, add, animate);

    }    

    async scoreAsync(token = {}, add = 0, animate = true){
        let cancelled = false;

        token.cancel = () => {
            cancelled = true;
        };            

        if(animate){
            if(!cancelled){ 
                this.app.assets['scoreText'].text = 'score +' + add;
            }   

            if(!cancelled){ 
                await sleep(2000);
            }        
    
            if(!cancelled){ 
                this.app.assets['scoreText'].text = 'score ' + this.scoreCurrent;
            }   

        }else{
            if(!cancelled){ 
                this.app.assets['scoreText'].text = 'score ' + this.scoreCurrent;
            }

        }

    }   

    scoreCancel(){
        if(this.scoreToken != null){
            this.scoreToken.cancel();
        }

    }        

}
