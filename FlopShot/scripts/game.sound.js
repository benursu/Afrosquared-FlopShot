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
// GameSound

export class GameSound {
  constructor(app, game) {
    this.app = app;
    this.game = game;

  }

  play(id = ''){
    switch (id) {
      case 'squish0':
        P.inputs.setPulse('playSquish0', R.once()); 
        break;

      case 'squish1':
        P.inputs.setPulse('playSquish1', R.once()); 
        break;

      case 'squish2':
        P.inputs.setPulse('playSquish2', R.once()); 
        break;

      case 'hit':
        P.inputs.setPulse('playHit', R.once()); 
        break;
        
      case 'split':
        P.inputs.setPulse('playSplit', R.once()); 
        break;
      
      case 'drop':
        P.inputs.setPulse('playDrop', R.once()); 
        break;
      
      case 'walk':
        P.inputs.setPulse('playWalk', R.once()); 
        break;
    
      case 'success':
        P.inputs.setPulse('playSuccess', R.once()); 
        break;

      case 'failure':
        P.inputs.setPulse('playFailure', R.once()); 
        break;

      case 'title':
        P.inputs.setPulse('playTitle', R.once()); 
        break;

      case 'dance':
        P.inputs.setPulse('playDance', R.once()); 
        break;
        
      default:
        //nothing

    }

  }

}
