//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// Flop Shot
// @afrosquared
// Spark AR Studio v123
// https://www.instagram.com/ar/1435438073524376/
// Attribution 4.0 International (CC BY 4.0) https://creativecommons.org/licenses/by/4.0/



//////////////////////////////////////////////////////////////////////////
// require/import

const S = require('Scene');
const R = require('Reactive');
const M = require('Materials');
const TX = require('Textures');
const D = require('Diagnostics');
const P = require('Patches');
const I = require('Instruction');
const A = require('Animation');
const T = require('Time');

import { sleep } from './util';
import { CameraInfoPosition } from './cameraInfoPosition';
import { Game } from './game';
import { PlaneTracker } from './planeTracker';



//////////////////////////////////////////////////////////////////////////
//configuration variables

const zombieBlendTrees = ['zombieMixed', 'zombieShadowMixed', 'zombieIdle', 'zombieWalk', 'zombieSwing', 'zombieDance'];
const zombieBones = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head', 'HeadTop_End', 'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'LeftHandThumb1', 'LeftHandThumb2', 'LeftHandThumb3', 'LeftHandIndex1', 'LeftHandIndex2', 'LeftHandMiddle1', 'LeftHandMiddle2', 'LeftHandRing1', 'LeftHandRing2', 'LeftHandRing3', 'LeftHandPinky1', 'LeftHandPinky2', 'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand', 'RightHandThumb1', 'RightHandThumb2', 'RightHandThumb3', 'RightHandIndex1', 'RightHandIndex2', 'RightHandMiddle1', 'RightHandMiddle2', 'RightHandRing1', 'RightHandRing2', 'RightHandRing3', 'RightHandPinky1', 'RightHandPinky2', 'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'LeftToeBase', 'RightUpLeg', 'RightLeg', 'RightFoot', 'RightToeBase'];
const brainsTotal = 6;
const settings = {};

//debug
let debug = false;
// debug = true;  //to skip intro



//////////////////////////////////////////////////////////////////////////
//Big thanks to the following!

//Zombie Character and Animations provided by Adobe Mixamo
//https://www.mixamo.com/

//Brain provided by spliter
//https://sketchfab.com/3d-models/brain-e9b9e383a4ec486a96d561c0b2f27946

//Night Cityscape Cyberpunk 03 LUTs provided by www.freeject.net 
//https://www.freeject.net/2019/07/night-cityscape-cyberpunk-03-luts-free.html

//Feast of Flesh Font provided by www.dafont.com
//https://www.dafont.com/feast-of-flesh-bb.font

//Flag Pole by Frank Vitale @creativefrv
//https://www.instagram.com/creativefrv/

//Lenslist Halloween Tricks & Treats Hackathon
//https://blog.lenslist.co/2021/11/03/winners-announcement-1-c4c-halloween/



//////////////////////////////////////////////////////////////////////////
//preload

var preload = [
    { id: 'Device', promise: S.root.findFirst('Device') },
    { id: 'Camera', promise: S.root.findFirst('Camera') },    

    //planeTracker
    { id: 'planeTracker', promise: S.root.findFirst('planeTracker') },
    { id: 'planeTrackerScene', promise: S.root.findFirst('planeTrackerScene') },    
    { id: 'planeTrackerContainerNull', promise: S.root.findFirst('planeTrackerContainerNull') },
    { id: 'trackerInstruction', promise: S.root.findFirst('trackerInstruction') },

    //content
    { id: 'debug', promise: S.root.findFirst('debug') },    
    { id: 'test1', promise: S.root.findFirst('test1') },        
    { id: 'tester', promise: S.root.findFirst('tester') },        
    { id: 'game', promise: S.root.findFirst('game') },    
    { id: 'rainSplatterEmitter', promise: S.root.findFirst('rainSplatterEmitter') },
    { id: 'planePlacement', promise: S.root.findFirst('planePlacement') },
    
    { id: 'hole', promise: S.root.findFirst('hole') },    

    { id: 'brains', promise: S.root.findFirst('brains') },    

    { id: 'titleShadow0Material', promise: M.findFirst('titleShadow0') },
    { id: 'titleShadow1Material', promise: M.findFirst('titleShadow1') },
    { id: 'title0', promise: S.root.findFirst('title0') },
    { id: 'title1', promise: S.root.findFirst('title1') },
    { id: 'title2', promise: S.root.findFirst('title2') },
    { id: 'title3', promise: S.root.findFirst('title3') },
    { id: 'title4', promise: S.root.findFirst('title4') },
    { id: 'title5', promise: S.root.findFirst('title5') },
    { id: 'title6', promise: S.root.findFirst('title6') },
    { id: 'title7', promise: S.root.findFirst('title7') },

    { id: 'zombie', promise: S.root.findFirst('zombie') },
    { id: 'zombieMixed', promise: S.root.findFirst('zombieMixed') },
    { id: 'zombieIdle', promise: S.root.findFirst('zombieIdle') },
    { id: 'zombieWalk', promise: S.root.findFirst('zombieWalk') },
    { id: 'zombieSwing', promise: S.root.findFirst('zombieSwing') },
    { id: 'zombieDance', promise: S.root.findFirst('zombieDance') },
    { id: 'zombieControllerIdle', promise: S.root.findFirst('zombieControllerIdle') },
    { id: 'zombieControllerWalk', promise: S.root.findFirst('zombieControllerWalk') },
    { id: 'zombieControllerSwing', promise: S.root.findFirst('zombieControllerSwing') },
    { id: 'zombieControllerDance', promise: S.root.findFirst('zombieControllerDance') },    
    { id: 'zombieBodyMaterial', promise: M.findFirst('zombieBody') },   
    { id: 'zombieShoeMaterial', promise: M.findFirst('zombieShoe') },   
    { id: 'zombieClubMaterial', promise: M.findFirst('zombieClub') },   
    { id: 'zombieShadow', promise: S.root.findFirst('zombieShadow') },   
    { id: 'zombieShadowMixed', promise: S.root.findFirst('zombieShadowMixed') },   
    { id: 'zombieShadowMaterial', promise: M.findFirst('zombieShadow') },   
    
    { id: 'meter', promise: S.root.findFirst('meter') },
    { id: 'meterCircleMaterial', promise: M.findFirst('meterCircle') },
    { id: 'meterRotation', promise: S.root.findFirst('meterRotation') },
    { id: 'meterCircle', promise: S.root.findFirst('meterCircle') },
    { id: 'meterCircleDistance', promise: S.root.findFirst('meterCircleDistance') },    
    { id: 'meterPlacement', promise: S.root.findFirst('meterPlacement') },
    { id: 'meterPlacementRotation', promise: S.root.findFirst('meterPlacementRotation') },    
    { id: 'meterPlacementCircle', promise: S.root.findFirst('meterPlacementCircle') },
    
    { id: 'scoreText', promise: S.root.findFirst('scoreText') },
    { id: 'scoreBkgMaterial', promise: M.findFirst('scoreBkg') },
    { id: 'scoreTextMaterial', promise: M.findFirst('scoreText') },
    { id: 'scoreBrain0Material', promise: M.findFirst('scoreBrain0') },
    { id: 'scoreBrain1Material', promise: M.findFirst('scoreBrain1') },
    { id: 'scoreBrain2Material', promise: M.findFirst('scoreBrain2') },
    { id: 'scoreBrain3Material', promise: M.findFirst('scoreBrain3') },
    { id: 'scoreBrain4Material', promise: M.findFirst('scoreBrain4') },
    { id: 'scoreBrain5Material', promise: M.findFirst('scoreBrain5') },    

];

//brains
for(let i = 0; i < brainsTotal; i++){
    preload.push({ id: 'brain' + i, promise: S.root.findFirst('brain' + i) });
    preload.push({ id: 'brainContainer' + i, promise: S.root.findFirst('brainContainer' + i) });
    preload.push({ id: 'brainContainerWhole' + i, promise: S.root.findFirst('brainContainerWhole' + i) });
    preload.push({ id: 'brainContainerLeft' + i, promise: S.root.findFirst('brainContainerLeft' + i) });
    preload.push({ id: 'brainContainerLeftShadow' + i, promise: S.root.findFirst('brainContainerLeftShadow' + i) });
    preload.push({ id: 'brainContainerRight' + i, promise: S.root.findFirst('brainContainerRight' + i) });
    preload.push({ id: 'brainContainerRightShadow' + i, promise: S.root.findFirst('brainContainerRightShadow' + i) });
    preload.push({ id: 'brainShadow' + i, promise: S.root.findFirst('brainShadow' + i) });
    preload.push({ id: 'brainSplatterEmitter' + i, promise: S.root.findFirst('brainSplatterEmitter' + i) });
    preload.push({ id: 'brainHitEmitter' + i, promise: S.root.findFirst('brainHitEmitter' + i) });
    
}



//////////////////////////////////////////////////////////////////////////
//App

const App = {
    //init
    assets: {},
    settings: settings,
    debug: debug,
    zombieBlendTrees: zombieBlendTrees,
    zombieBones: zombieBones,
    brainsTotal: brainsTotal,
    time: T.ms.div(1000),

    //from script
    deviceScreenSize: null,
    deviceScreenScale: null,

    init(preload = []) {
        let promises = [];
        preload.forEach((asset, i) => {
            promises.push(asset.promise);
        });
        Promise.all(promises).then(results => this.onLoad(results));

    },

    onLoad(results) {
        results.forEach((promise, i) => {
            this.assets[preload[i].id] = promise;
        });
        
        this.preloadZombieBlendTree();
      
    },

    preloadZombieBlendTree(){
        this.preloadZombieBlendTree = [];
  
        for(let i = 0; i < this.zombieBlendTrees.length; i++){
            const parentID = this.zombieBlendTrees[i];
            for(let k = 0; k < this.zombieBones.length; k++){
                const boneID = this.zombieBones[k];
                this.preloadZombieBlendTree.push({ id: parentID + '.' + boneID, promise: this.assets[parentID].findFirst(boneID) });
            }
        }
        
        let promises = [];
        this.preloadZombieBlendTree.forEach((asset, i) => {
            promises.push(asset.promise);
        });
        Promise.all(promises).then(results => this.onLoadZombieBlendTree(results));   
        
    },

    onLoadZombieBlendTree(results) {
        results.forEach((promise, i) => {
            this.assets[this.preloadZombieBlendTree[i].id] = promise;
        });
    
        this.complete();
    },        

    complete(){ 
        this.cameraInfoPosition = new CameraInfoPosition(this);
        this.cameraInfoPosition.monitor().then(() => {
            this.planeTracker = new PlaneTracker(this);

            this.game = new Game(this);
            this.game.init();

            if(this.cameraInfoPosition.direction == 'front'){
                this.front(true);
            }else{
                this.back(true);
            }

        });

    },

    async front(firstTime = false){
      I.bind(true, 'flip_camera');

      this.planeTracker.front();
      this.game.front();

    },

    async back(firstTime = false){
      I.bind(false, 'flip_camera');

      this.planeTracker.back();
      this.game.back();

    },

}



//////////////////////////////////////////////////////////////////////////
//App init
App.init(preload);

