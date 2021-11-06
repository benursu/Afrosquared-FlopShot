//////////////////////////////////////////////////////////////////////////
// require/import

const D = require('Diagnostics');
const S = require('Scene');
const TG = require('TouchGestures');
const R = require('Reactive');
const A = require('Animation');
const I = require('Instruction');
const P = require('Patches');
const T = require('Time');
const PlaneTracking = require('PlaneTracking');
const B = require('Blocks');

import { sleep, degToRad, rotation360, rotation90 } from './util';



//////////////////////////////////////////////////////////////////////////
// PlaneTracker

export class PlaneTracker {
    constructor(app) {
        this.app = app;

        this.debugStringValue = '';

        //configs
        this.planeTrackerContainerNullPanScreenFactor = 0.000225;

        //
        this.planeTracker = this.app.assets['planeTracker'];
        this.planeTrackerContainerNull = this.app.assets['planeTrackerContainerNull'];

        this.cameraDirection = this.app.assets['Camera'].worldTransform.applyToVector(R.vector(1, 0, 0));        
        // this.app.assets['planeTrackerScene'].transform.rotationY = this.planeTracker.worldTransform.rotationZ.mul(-1);

        //
        this.checkRealScaleSupportedStarted = false;
        this.tapToPlaceSub = null;
        this.onTapSub = null;
        this.onTapPlaneTrackerSub = null;
        this.onLongPressPlaneTrackerSub = null;
        this.onPanSub = null;
        this.onPinchSub = null;
        this.onRotateSub = null;

        //
        this.app.assets['game'].transform.position = this.planeTrackerContainerNull.worldTransform.position;
        this.app.assets['game'].transform.rotationX = this.planeTrackerContainerNull.worldTransform.rotationX;
        this.app.assets['game'].transform.rotationY = this.planeTrackerContainerNull.worldTransform.rotationY;
        this.app.assets['game'].transform.rotationZ = this.planeTrackerContainerNull.worldTransform.rotationZ;
        this.app.assets['game'].transform.scaleX = this.app.assets['game'].transform.scaleY = this.app.assets['game'].transform.scaleZ = this.planeTrackerContainerNull.transform.scaleX;            

    }

    debugString(str){
        this.debugStringValue += str;
        this.app.assets['test1'].text = this.debugStringValue;
    }

    front(){
            
    }

    back(){
        if(!this.checkRealScaleSupportedStarted){
            this.checkRealScaleSupportedStarted = true;
            this.checkRealScaleSupported();
        }

    }

    async checkRealScaleSupported(){
        I.bind(true, 'find_a_surface');            

        if(!this.app.debug){
            await sleep(1000);
        }

        T.setTimeoutWithSnapshot({ realScaleSupported:   
            PlaneTracking.realScaleSupported}, (s) => {
                if (s.realScaleSupported){
                    this.checkRealScaleReady();
                } else {
                    this.gesturesInit();
                }
        }, 500);

    }

    checkRealScaleReady(){
        PlaneTracking.realScaleActive.monitor({fireOnInitialValue:true}).subscribe( (active) =>{
            if(active.newValue) {
                this.gesturesInit();
            } else {
                //wait
            }
        });
    }

    gesturesInit(){
        I.bind(false, 'find_a_surface');
        I.bind(true, 'tap_to_place');

        this.app.assets['trackerInstruction'].inputs.setBoolean('hidden', true);

        this.tapToPlaceSub = TG.onTap().subscribe(gesture => {
            this.tapToPlaceSub.unsubscribe();
            I.bind(false, 'tap_to_place');

            this.planeTrackerContainerNull.transform.x = 0;
            this.planeTrackerContainerNull.transform.z = 0;
            this.planeTracker.trackPoint(gesture.location);

            this.gesturesInit2();

        }); 

    }

    gesturesInit2(){
        this.gestureTapInit();

        this.onLongPressPlaneTrackerSub = TG.onLongPress(this.planeTracker).subscribe(gesture => {
            this.planeTrackerContainerNull.transform.x = 0;
            this.planeTrackerContainerNull.transform.z = 0;
            this.planeTracker.trackPoint(gesture.location, gesture.state);

        });           

        this.onPanSub = TG.onPan().subscribeWithSnapshot({ 'this.cameraDirection.x': this.cameraDirection.x, 'this.cameraDirection.y': this.cameraDirection.y, 'this.cameraDirection.z': this.cameraDirection.z }, (gesture, snapshots) => {
            let cameraDirectionX = snapshots['this.cameraDirection.x'];
            let cameraDirectionY = snapshots['this.cameraDirection.y'];
            let cameraDirectionZ = snapshots['this.cameraDirection.z'];

            let speedFactorX = cameraDirectionX;
            let speedFactorZ = -cameraDirectionY;
            if(this.app.debug){
                //spark studio has a different up direction then player
                speedFactorZ = cameraDirectionZ;
            }
            let speed = this.planeTrackerContainerNullPanScreenFactor;

            this.planeTrackerContainerNull.transform.x = R.add(this.planeTrackerContainerNull.transform.x.pinLastValue(), (R.mul(gesture.translation.x, speed * speedFactorX)).add(R.mul(gesture.translation.y, -speed * speedFactorZ)));
            this.planeTrackerContainerNull.transform.z = R.add(this.planeTrackerContainerNull.transform.z.pinLastValue(), (R.mul(gesture.translation.y, speed * speedFactorX)).add(R.mul(gesture.translation.x, speed * speedFactorZ)));

        });  
    
        this.onPinchSub = TG.onPinch().subscribe(gesture => {
            this.planeTrackerContainerNull.transform.scaleX = R.mul(this.planeTrackerContainerNull.transform.scaleX.pinLastValue(), gesture.scale);
            this.planeTrackerContainerNull.transform.scaleY = R.mul(this.planeTrackerContainerNull.transform.scaleY.pinLastValue(), gesture.scale);
            this.planeTrackerContainerNull.transform.scaleZ = R.mul(this.planeTrackerContainerNull.transform.scaleZ.pinLastValue(), gesture.scale);
    
        });
    
        this.onRotateSub = TG.onRotate().subscribeWithSnapshot({ 'planeTrackerContainerNull.transform.rotationY': this.planeTrackerContainerNull.transform.rotationY }, (gesture, snapshots) => {
            this.planeTrackerContainerNull.transform.rotationY = R.add(this.planeTrackerContainerNull.transform.rotationY.pinLastValue(), R.mul(-1, gesture.rotation));
            
        });
        
        this.app.game.intro();

    }

    gestureTapInit(){
      
        this.onTapPlaneTrackerSub = TG.onTap(this.planeTracker).subscribe(gesture => {
            if(this.app.game.mode != 'playing'){
                this.planeTrackerContainerNull.transform.x = 0;
                this.planeTrackerContainerNull.transform.z = 0;
                this.planeTracker.trackPoint(gesture.location);

            }
        });   

    }

    gestureTapRemove(){
        if(this.onTapPlaneTrackerSub != null){
            this.onTapPlaneTrackerSub.unsubscribe();
        }
    }

}
